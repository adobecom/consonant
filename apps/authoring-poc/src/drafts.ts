import { validateDocument, type PageDocument } from "./model";
export interface Draft {
  revision: number;
  document: PageDocument;
  savedAt: string;
}
/** The stored draft exists but no longer validates (saved by an older build). */
export class IncompatibleDraft extends Error {
  constructor(public revision: number, detail: string) {
    super(detail);
  }
}
export class DraftConflict extends Error {
  constructor() {
    super(
      "This draft changed in another tab. Export your changes, then load the saved draft.",
    );
  }
}
const database = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    // Isolate production and PR-preview drafts on the same Pages origin.
    const request = indexedDB.open(
      `s2a-authoring:${new URL(".", location.href).pathname}`,
      1,
    );
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error("Draft storage is blocked by another tab."));
  });
export async function loadDraft(): Promise<Draft | undefined> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("drafts", "readonly");
      const request = tx.objectStore("drafts").get("current");
      tx.oncomplete = () => {
        try {
          if (request.result) validateDocument(request.result.document);
          resolve(request.result);
        } catch (error) {
          reject(
            new IncompatibleDraft(
              Number(request.result?.revision) || 0,
              error instanceof Error ? error.message : "Invalid draft",
            ),
          );
        }
      };
      tx.onerror = () => reject(tx.error);
      tx.onabort = () =>
        reject(tx.error || new Error("Draft read was interrupted."));
    });
  } finally {
    db.close();
  }
}
export async function saveDraft(
  document: PageDocument,
  expectedRevision: number,
): Promise<Draft> {
  validateDocument(document);
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("drafts", "readwrite");
      const store = tx.objectStore("drafts");
      const request = store.get("current");
      const next: Draft = {
        revision: expectedRevision + 1,
        document,
        savedAt: new Date().toISOString(),
      };
      let conflict = false;
      request.onsuccess = () => {
        if ((request.result?.revision ?? 0) !== expectedRevision) {
          conflict = true;
          tx.abort();
        } else store.put(next, "current");
      };
      tx.oncomplete = () => resolve(next);
      tx.onabort = () =>
        reject(
          conflict
            ? new DraftConflict()
            : tx.error || new Error("Draft save was interrupted."),
        );
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
