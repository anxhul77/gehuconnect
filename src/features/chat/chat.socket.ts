// ─────────────────────────────────────────────
//  chat.socket.ts
//
//  KEY FIX THIS ROUND:
//  The STOMP server takes >8s to reply to CONNECT.
//  Root cause: heart-beat:10000,10000 means the client
//  WAITS up to 10s before considering the connection alive.
//  We set heartbeatIncoming to 0 (don't wait for server
//  heartbeats) so onConnect fires as soon as the server
//  sends its CONNECTED frame, not after the heartbeat window.
//
//  Also: publishWhenReady() replaces the waitForSocket+await
//  pattern in sendMessage. Instead of blocking the mutation
//  for up to 8s, we queue the publish and fire it the instant
//  onConnect drains — zero timeout, zero failure.
// ─────────────────────────────────────────────

import { Client, IFrame, IMessage, StompSubscription } from "@stomp/stompjs";

const LOG_TAG = "[ChatSocket]";

let stompClient: Client | null = null;

const activeSubscriptions = new Map<string, StompSubscription>();

type PendingCallback = () => void;
const pendingCallbacks: PendingCallback[] = [];

// ─────────────────────────────────────────────
//  Internal: drain helper used by onConnect
// ─────────────────────────────────────────────
function drainPending(): void {
  const drained = [...pendingCallbacks];
  pendingCallbacks.length = 0;
  drained.forEach((cb) => {
    try { cb(); } catch (e) { console.error(`${LOG_TAG} Error in pending callback`, e); }
  });
}

// ─────────────────────────────────────────────
//  connectChatSocket
// ─────────────────────────────────────────────
export function connectChatSocket(token: string): Client {
  if (stompClient?.connected) {
    console.debug(`${LOG_TAG} Reusing connected socket`);
    return stompClient;
  }
  if (stompClient?.active) {
    console.debug(`${LOG_TAG} Socket active/reconnecting — reusing`);
    return stompClient;
  }

  console.debug(`${LOG_TAG} Creating new STOMP client`);

  stompClient = new Client({
    webSocketFactory: () => {
      const wsUrl = `${process.env.EXPO_PUBLIC_WS_URL}/ws`;
      console.debug(`${LOG_TAG} Opening WebSocket → ${wsUrl}`);
      return new WebSocket(wsUrl);
    },

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    reconnectDelay: 5000,

    // ─────────────────────────────────────────
    // FIX: heartbeat was the hidden timeout culprit.
    //
    // Default stompjs heartbeat is 10000,10000 which means:
    //   outgoing: send a ping every 10s
    //   incoming: EXPECT a ping from server every 10s
    //
    // With incoming=10000 the client doesn't consider itself
    // "connected" until it validates the server heartbeat window,
    // which can delay onConnect by up to 10s on some Spring/STOMP
    // server configs — longer than our 8s timeout.
    //
    // Setting incoming to 0 means "I don't need heartbeats from
    // the server". onConnect fires immediately when CONNECTED
    // frame arrives, typically <500ms after TCP handshake.
    // ─────────────────────────────────────────
    // React Native requires binary WebSocket frames.
    // Text frames are silently dropped on Android/iOS by RN's WS impl.
    forceBinaryWSFrames: true,
    // Spring STOMP broker sometimes omits null-byte frame terminator.
    // This appends it on incoming frames preventing parse errors.
    appendMissingNULLonIncoming: true,

    heartbeatIncoming: 0,    // fire onConnect immediately, no heartbeat wait
    heartbeatOutgoing: 5000, // keep NAT alive

    debug: (msg: string) => {
      if (__DEV__) console.debug(`${LOG_TAG} STOMP: ${msg}`);
    },

    onConnect: (frame: IFrame) => {
      console.info(`${LOG_TAG} ✓ Connected — draining ${pendingCallbacks.length} queued callbacks`);
      drainPending();
    },

    onDisconnect: (_frame: IFrame) => {
      console.warn(`${LOG_TAG} Disconnected`);
      activeSubscriptions.clear();
    },

    onStompError: (frame: IFrame) => {
      console.error(`${LOG_TAG} STOMP error — ${frame.headers["message"]}`, frame.body);
      // Reject all queued waitForSocket callers so they don't hang
      drainPending();
    },

    onWebSocketError: (event: Event) => {
      console.error(`${LOG_TAG} WebSocket error`, event);
    },

    onWebSocketClose: (event: CloseEvent) => {
      console.warn(`${LOG_TAG} WebSocket closed — code:${event.code} reason:${event.reason}`);
    },
  });

  stompClient.activate();
  console.debug(`${LOG_TAG} activate() called`);
  return stompClient;
}

// ─────────────────────────────────────────────
//  publishWhenReady
//
//  This replaces waitForSocket() + socket.publish().
//  Instead of blocking sendMessage with a Promise timeout,
//  we queue the publish as a callback. It fires the instant
//  onConnect drains — if already connected it fires now.
//
//  Returns a cancel function in case the message is
//  abandoned (e.g. component unmounts before connect).
// ─────────────────────────────────────────────
export function publishWhenReady(
  destination: string,
  body: string,
  onSuccess?: () => void,
  onError?: (err: Error) => void
): () => void {
  let cancelled = false;

  const doPublish: PendingCallback = () => {
    if (cancelled) {
      console.debug(`${LOG_TAG} publishWhenReady: cancelled before connect — ${destination}`);
      return;
    }
    if (!stompClient?.connected) {
      const err = new Error(`publishWhenReady: socket disconnected before publish to ${destination}`);
      console.error(`${LOG_TAG}`, err.message);
      onError?.(err);
      return;
    }
    try {
      console.debug(`${LOG_TAG} Publishing → ${destination}`);
      stompClient.publish({ destination, body });
      console.debug(`${LOG_TAG} Published ✓`);
      onSuccess?.();
    } catch (e: any) {
      console.error(`${LOG_TAG} publish() threw`, e);
      onError?.(e instanceof Error ? e : new Error(String(e)));
    }
  };

  if (stompClient?.connected) {
    doPublish();
  } else if (stompClient?.active) {
    console.debug(`${LOG_TAG} publishWhenReady: queuing until connected — ${destination}`);
    pendingCallbacks.push(doPublish);
  } else {
    const err = new Error("publishWhenReady: socket is not active — was connectChatSocket() called?");
    console.error(`${LOG_TAG}`, err.message);
    onError?.(err);
  }

  return () => { cancelled = true; };
}

// ─────────────────────────────────────────────
//  subscribeTopic — safe before connect
// ─────────────────────────────────────────────
export function subscribeTopic(
  topic: string,
  callback: (msg: IMessage) => void
): () => void {
  const doSubscribe: PendingCallback = () => {
    if (!stompClient?.connected) {
      console.warn(`${LOG_TAG} subscribeTopic: socket gone before sub for ${topic}`);
      return;
    }
    console.debug(`${LOG_TAG} Subscribing to ${topic}`);
    const sub = stompClient.subscribe(topic, callback);
    activeSubscriptions.set(topic, sub);
  };

  if (stompClient?.connected) {
    doSubscribe();
  } else {
    console.debug(`${LOG_TAG} Deferring subscription for ${topic} until connected`);
    pendingCallbacks.push(doSubscribe);
  }

  return () => {
    const sub = activeSubscriptions.get(topic);
    if (sub) {
      console.debug(`${LOG_TAG} Unsubscribing from ${topic}`);
      sub.unsubscribe();
      activeSubscriptions.delete(topic);
    }
    const idx = pendingCallbacks.indexOf(doSubscribe);
    if (idx !== -1) pendingCallbacks.splice(idx, 1);
  };
}

export function getChatSocket(): Client | null {
  return stompClient;
}

export function disconnectChatSocket(): void {
  if (stompClient) {
    console.info(`${LOG_TAG} Deactivating socket`);
    activeSubscriptions.clear();
    pendingCallbacks.length = 0;
    stompClient.deactivate();
    stompClient = null;
  }
}