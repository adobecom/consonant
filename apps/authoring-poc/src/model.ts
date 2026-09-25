import Ajv2020 from "ajv/dist/2020.js";
import schema from "./page.schema.json";
import homepageSchema from "./homepage.schema.json";
export type { AssetId, VideoAssetId } from "./assets";
import type { AssetId, VideoAssetId } from "./assets";

export interface Quote {
  id: string;
  component: "quote-card";
  componentVersion: 1;
  props: {
    quote: string;
    attributionName: string;
    attributionRole: string;
    imageAssetId: AssetId;
    showAttribution: boolean;
    showCta: boolean;
  };
  slots: { cta: { kind: "link"; label: string; href: string } };
}
export interface Carousel {
  id: string;
  component: "social-proof-carousel";
  componentVersion: 1;
  items: Quote[];
}
export interface ContentFields {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  imageAssetId: AssetId | "";
  /** Optional muted background video; the image is the poster/fallback. */
  videoAssetId?: VideoAssetId | "";
  imageAlt: string;
}
export interface ContentItem extends ContentFields {
  id: string;
  label: string;
  app: string;
  group: string;
}
export interface ContentSection {
  id: string;
  component: "global-navigation" | "router-marquee" | "hub-router" | "media-section" | "news-section" | "product-router" | "site-footer";
  componentVersion: 1;
  props: ContentFields;
  items: ContentItem[];
}
export type Section = Quote | Carousel | ContentSection;
export const isContentSection = (section: Section): section is ContentSection =>
  section.component !== "quote-card" && section.component !== "social-proof-carousel";
export interface PageDocument {
  schemaVersion: 1;
  id: string;
  title: string;
  locale: "en-US";
  theme: "light" | "dark";
  sections: Section[];
}

export function safeLink(value: string): boolean {
  if (!value || /[\s\\\u0000-\u001f\u007f]/.test(value)) return false;
  if (value.startsWith("#")) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

const ajv = new Ajv2020({ allErrors: true, strict: true });
ajv.addFormat("safe-link", safeLink);
ajv.addSchema(homepageSchema);
const validateSchema = ajv.compile<PageDocument>(schema);
export const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;

export function validateDocument(
  value: unknown,
): asserts value is PageDocument {
  if (!validateSchema(value)) {
    const first = validateSchema.errors?.find(
      (error) => error.keyword !== "const",
    );
    throw new Error(
      `Invalid page: ${first?.instancePath || "/"} ${first?.message || "unsupported document"}`,
    );
  }
  const ids = new Set([value.id]);
  for (const section of value.sections) {
    for (const item of [
      section,
      ...(section.component !== "quote-card" ? section.items : []),
    ]) {
      if (ids.has(item.id)) throw new Error(`Duplicate ID: ${item.id}`);
      ids.add(item.id);
    }
  }
}

export function parseDocument(text: string): PageDocument {
  if (new TextEncoder().encode(text).length > MAX_DOCUMENT_BYTES)
    throw new Error("Page exceeds the 2 MiB import limit.");
  const value: unknown = JSON.parse(text);
  validateDocument(value);
  return value;
}

export function serializeDocument(value: PageDocument): string {
  validateDocument(value);
  return JSON.stringify(value, null, 2);
}
export const newId = () => crypto.randomUUID();
export function duplicateSection(section: Section): Section {
  const copy = structuredClone(section);
  copy.id = newId();
  if (copy.component !== "quote-card")
    copy.items.forEach((item) => (item.id = newId()));
  return copy;
}

export class History {
  private past: PageDocument[] = [];
  private future: PageDocument[] = [];
  private group: string | undefined;
  private committedAt = 0;
  constructor(public current: PageDocument) {}
  commit(next: PageDocument, group?: string) {
    validateDocument(next);
    if (JSON.stringify(next) === JSON.stringify(this.current)) return false;
    const now = Date.now();
    if (!group || group !== this.group || now - this.committedAt > 800)
      this.past.push(structuredClone(this.current));
    this.group = group;
    this.committedAt = now;
    if (this.past.length > 50) this.past.shift();
    this.future = [];
    this.current = structuredClone(next);
    return true;
  }
  undo() {
    this.group = undefined;
    const previous = this.past.pop();
    if (!previous) return false;
    this.future.push(this.current);
    this.current = previous;
    return true;
  }
  redo() {
    this.group = undefined;
    const next = this.future.pop();
    if (!next) return false;
    this.past.push(this.current);
    this.current = next;
    return true;
  }
  get canUndo() {
    return this.past.length > 0;
  }
  get canRedo() {
    return this.future.length > 0;
  }
}
