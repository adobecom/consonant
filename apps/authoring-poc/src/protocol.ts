import type { PageDocument } from "./model";
export interface PreviewUpdate {
  channel: string;
  type: "render";
  revision: number;
  document: PageDocument;
  selectedId: string;
  slideIndex: number;
  editing: boolean;
}
/** Local, unthrottled measurements from the preview frame: a sanity check
 *  while authoring, not the lab numbers (see scripts/perf.mjs). */
export interface PreviewMetrics {
  lcpMs: number | null;
  cls: number;
  longTaskBlockingMs: number;
  jsBytes: number;
  cssBytes: number;
  imageBytes: number;
  videoBytes: number;
  fontBytes: number;
  totalBytes: number;
  requests: number;
  images: number;
  at: number;
}
export interface PreviewReply {
  channel: string;
  type: "ready" | "rendered" | "select" | "error" | "metrics";
  revision?: number;
  id?: string;
  message?: string;
  duration?: number;
  controllers?: number;
  metrics?: PreviewMetrics;
}
