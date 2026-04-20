import { useCallback, useRef, useState } from "react";
import { useAppSelector } from "@/src/store/Hooks";
import { LocalAttachment } from "../types/Attachment.types";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";

const MAX_PARALLEL_UPLOADS = 3;
const MAX_RETRIES = 2;
const UPLOAD_TIMEOUT = 60000;

const BASE_URL = process.env.EXPO_PUBLIC_BACK_END_URL ?? "";
 export const uploadToR2 = async (presignedUrl: string, uri: string, mimeType: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();

  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
    },
    body: blob,
  });
  console.log(uploadResponse)
  console.log(uploadResponse.status)
  if (!uploadResponse.ok) {

    console.log("uplaod failed didnt get upploaded")
    throw new Error("Upload failed");
  }
};
interface PresignResponse {
  presignedUrl: string;
  key: string;
  publicUrl: string;
  uploadId: string;
  fileSize: string;
  category: string;
  mimeType: string;
}


const presignWithRetry = async (
  requestBody: any,
  channelId: string,
  token: string
): Promise<PresignResponse[]> => {
  let attempts = 0;

  while (attempts <= MAX_RETRIES) {
    try {
      const res = await fetch(
        `${BASE_URL}/media/getChannelPresigned?channelId=${channelId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!res.ok) throw new Error(`Presign failed: ${res.status}`);

      return await res.json();
    } catch (e) {
      attempts++;
      if (attempts > MAX_RETRIES) throw e;
      await delay(1500 * attempts);
    }
  }

  throw new Error("Presign failed after retries");
};

/* ======================== */
/* UPLOAD SINGLE            */
/* ======================== */

const uploadSingle = async (
  item: LocalAttachment,
  presign: PresignResponse,
  updateAttachment: (localId: string, patch: Partial<LocalAttachment>) => void,
  xhrMap: React.MutableRefObject<Map<string, XMLHttpRequest>>,
  cancelledIds: React.MutableRefObject<Set<string>>
): Promise<void> => {
  let attempts = 0;

  // Guard: don't start if already cancelled
  if (cancelledIds.current.has(item.localId)) return;

  const safeUpdate = (localId: string, patch: Partial<LocalAttachment>) => {
    if (!cancelledIds.current.has(localId)) {
      updateAttachment(localId, patch);
    }
  };

  while (attempts <= MAX_RETRIES) {
    // Guard: check again before each retry
    if (cancelledIds.current.has(item.localId)) return;

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrMap.current.set(item.localId, xhr);

        const timeout = setTimeout(() => {
          xhr.abort();
        }, UPLOAD_TIMEOUT);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            safeUpdate(item.localId, {
              progress: Math.round((e.loaded / e.total) * 100),
            });
          }
        };

        xhr.onload = () => {
          clearTimeout(timeout);
          xhrMap.current.delete(item.localId);

          if (xhr.status >= 200 && xhr.status < 300) {
            safeUpdate(item.localId, {
              status: "uploaded",
              progress: 100,
              publicUrl: presign.publicUrl,
              key: presign.key,
            });
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.onabort = () => reject(new Error("Aborted"));

        xhr.open("PUT", presign.presignedUrl);
        xhr.setRequestHeader("Content-Type", item.mimeType);

        fetch(item.uri)
          .then((r) => r.blob())
          .then((blob) => {
            // Final guard before actually sending
            if (cancelledIds.current.has(item.localId)) {
              clearTimeout(timeout);
              xhr.abort();
              return;
            }
            xhr.send(blob);
          })
          .catch(reject);
      });

      return; // success — exit retry loop
    } catch (e: any) {
      // Don't retry if it was an abort/cancel
      if (e?.message === "Aborted" || cancelledIds.current.has(item.localId)) {
        return;
      }

      attempts++;
      safeUpdate(item.localId, { retryCount: attempts });
      await delay(1000 * attempts);

      if (attempts > MAX_RETRIES) {
        safeUpdate(item.localId, { status: "error" });
        throw e;
      }
    }
  }
};

/* ======================== */
/* UPLOAD QUEUE             */
/* ======================== */

const uploadQueue = async (
  items: LocalAttachment[],
  presigns: PresignResponse[],
  updateAttachment: (localId: string, patch: Partial<LocalAttachment>) => void,
  xhrMap: React.MutableRefObject<Map<string, XMLHttpRequest>>,
  cancelledIds: React.MutableRefObject<Set<string>>
): Promise<void> => {
  const queue = items.map((item, i) => ({ item, presign: presigns[i] }));

  const workers = Array(Math.min(MAX_PARALLEL_UPLOADS, items.length))
    .fill(null)
    .map(async () => {
      while (queue.length) {
        const job = queue.shift();
        if (!job) return;

        try {
          await uploadSingle(
            job.item,
            job.presign,
            updateAttachment,
            xhrMap,
            cancelledIds
          );
        } catch (e) {
          console.error("[UploadQueue] Upload failed:", job.item.localId, e);
        }
      }
    });

  await Promise.all(workers);
};

/* ======================== */
/* HOOK                     */
/* ======================== */

export function useAttachmentUpload(channelId: string) {
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);

  const token = useAppSelector((s) => s.auth?.accessToken);
  const xhrMap = useRef<Map<string, XMLHttpRequest>>(new Map());

  // Tracks removed attachment IDs so stale XHR callbacks don't update state
  const cancelledIds = useRef<Set<string>>(new Set());

  const updateAttachment = useCallback(
    (localId: string, patch: Partial<LocalAttachment>) => {
      setAttachments((prev) =>
        prev.map((a) => (a.localId === localId ? { ...a, ...patch } : a))
      );
    },
    []
  );

  /* ── Prepare files ── */
  const prepareFiles = useCallback(async (items: LocalAttachment[]) => {
    return Promise.all(
      items.map(async (item) => {
        const info = await FileSystem.getInfoAsync(item.uri);
        const realSize = info.exists ? (info.size ?? item.fileSize) : item.fileSize;
        const checksum = await generateChecksum(item.uri);

        return {
          ...item,
          fileSize: realSize,
          checksum,
          status: "waiting" as const,
          retryCount: 0,
          progress: 0,
          isOptimistic: true,
          messageLinked: false,
          startedAt: Date.now(),
        };
      })
    );
  }, []);

  /* ── Add attachments ── */
  const addAttachments = useCallback(
    async (items: LocalAttachment[]) => {
      // Guard: must have auth token
      if (!token) {
        console.error("[UploadToR2] No auth token — aborting upload");
        return;
      }

      try {
        const prepared = await prepareFiles(items);

        setAttachments((prev) => [...prev, ...prepared]);
        prepared.forEach((item) =>
          updateAttachment(item.localId, { status: "presigning" })
        );

        const requestBody = prepared.map((i) => ({
          mimeType: i.mimeType,
          fileSize: i.fileSize,
          fileName: i.fileName,
          checkSum: i.checksum,
        }));

        const presigns = await presignWithRetry(requestBody, channelId, token);

        if (!presigns || presigns.length !== prepared.length) {
          throw new Error(
            `Presign mismatch: expected ${prepared.length}, got ${presigns?.length}`
          );
        }

        prepared.forEach((item, i) => {
          updateAttachment(item.localId, {
            uploadId: presigns[i].uploadId,
            status: "uploading",
          });
        });

        await uploadQueue(
          prepared,
          presigns,
          updateAttachment,
          xhrMap,
          cancelledIds
        );
      } catch (e) {
        console.error("[UploadToR2] Upload preparation failed:", e);
        items.forEach((item) =>
          updateAttachment(item.localId, { status: "error" })
        );
      }
    },
    [channelId, token, updateAttachment, prepareFiles]
  );

  /* ── Remove attachment ── */
  const removeAttachment = useCallback((localId: string) => {
    // Register as cancelled FIRST so any in-flight XHR callbacks are ignored
    cancelledIds.current.add(localId);
    xhrMap.current.get(localId)?.abort();
    xhrMap.current.delete(localId);
    setAttachments((prev) => prev.filter((a) => a.localId !== localId));
  }, []);

  /* ── Clear all ── */
  const clearAttachments = useCallback(() => {
    // Cancel all in-flight uploads
    attachments.forEach((a) => cancelledIds.current.add(a.localId));
    xhrMap.current.forEach((xhr) => xhr.abort());
    xhrMap.current.clear();
    setAttachments([]);
  }, [attachments]);

  /* ── Derived state ── */
  // FIX: "uploaded" is a terminal success state — must NOT count as uploading
  const isUploading = attachments.some(
    (a) => !["uploaded", "done", "error", "cancelled"].includes(a.status)
  );

  const allDone =
    attachments.length === 0 ||
    attachments.every((a) =>
      ["uploaded", "done", "error"].includes(a.status)
    );

  return {
    attachments,
    addAttachments,
    removeAttachment,
    clearAttachments,
    isUploading,
    allDone,
  };
}

/* ======================== */
/* CHECKSUM                 */
/* ======================== */

const generateChecksum = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const base64 = await blobToBase64(blob);

  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    base64,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const data = reader.result as string;
      resolve(data.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));