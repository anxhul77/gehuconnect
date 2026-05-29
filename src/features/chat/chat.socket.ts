

import { Client, IFrame, IMessage, StompSubscription } from "@stomp/stompjs";

const LOG_TAG = "[ChatSocket]";

let stompClient: Client | null = null;

const activeSubscriptions = new Map<string, StompSubscription>();

type PendingCallback = () => void;
const pendingCallbacks: PendingCallback[] = [];


function drainPending(): void {
  const drained = [...pendingCallbacks];
  pendingCallbacks.length = 0;
  drained.forEach((cb) => {
    try { cb(); } catch (e) { console.error(`${LOG_TAG} Error in pending callback`, e); }
  });
}


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


    forceBinaryWSFrames: true,

    appendMissingNULLonIncoming: true,

    heartbeatIncoming: 0,
    heartbeatOutgoing: 5000,

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