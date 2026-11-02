// main.ts — the Contract Book.
//
// Three panes. Left: the library — every contracted component, with its gate
// state, and a Figma link field to bring a new one in. Centre: the DEFS,
// editable. Right: everything derived from it — contract, spec, stylesheet,
// Lit, Milo, Figma plan — the component as Storybook has built it, and the
// parity score against the golden sheet.
//
// The centre pane edits the defs, not the contract. That is the one place
// this departs from the playground it follows, and it is deliberate: in this
// pipeline the contract is DERIVED and never edited, so putting a cursor in
// it would teach exactly the wrong habit. Change a decision, watch every
// surface move. Break a decision, read the refusal by name.
//
// The Book draws no component of its own. It did, for a while — a live
// preview with controls, a story index, a design overlay — and that was a
// worse Storybook that reconstructed every component from its contract, so
// every gap in the reconstruction was the Book's to chase. Now the Render tab
// is Storybook's own frame: for our components the generated code, for a
// shipped library (Spectrum) the library's own element. Sign off here, the
// build regenerates the stories, Storybook shows them, parity scores them.
import { LitElement, html, nothing, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { build, contracted, components, capturedAt, registerDraft, type BuildResult, type Refusal, type Component, systems, systemOf, storyPrefixOf } from "./engine";
import { nextPatch, type Patch } from "./heal";

// GitHub Pages serves the Book as a static snapshot (vite.config.ts sets the
// flag). Everything that reads is there; everything that needs Node — the Figma
// extractor, headless Chromium for parity, writing to the repo — is not.
const STATIC: boolean = typeof __BOOK_STATIC__ !== "undefined" && __BOOK_STATIC__;
const STATIC_NOTE = "Extract, parity, heal and save run on the dev server — clone the repo and run `npm run contract-book`";
// Where Storybook is. The site hosts both next to each other; on a dev machine
// it is the dev server on 6006 (override with VITE_STORYBOOK_URL).
const STORYBOOK: string = STATIC
  ? new URL("../storybook/", location.href).href.replace(/\/$/, "")
  : ((import.meta.env.VITE_STORYBOOK_URL as string | undefined) ?? "http://localhost:6006");

interface HealStep { iteration: number; patch: Patch; before: string; after?: string }

type OutputTab = "render" | "parity" | "contract" | "css" | "lit" | "milo" | "figma" | "spec" | "evidence" | "refusals";
const OUTPUT_TABS: [OutputTab, string][] = [
  ["render", "Render"], ["parity", "Parity"], ["contract", "Contract"], ["css", "CSS"], ["lit", "Lit"],
  ["milo", "Milo"], ["figma", "Figma plan"], ["spec", "Spec"], ["evidence", "Evidence"],
];
// Lit, CSS and Milo are what the pipeline GENERATES for our own components. A
// shipped library is not generated from its contract — Storybook mounts the
// library's element — so those tabs would show a reconstruction nobody ships.
const GENERATED_TABS = new Set<OutputTab>(["css", "lit", "milo"]);

// What /__parity/run answers — evals/visual/matrix-parity.mjs's rows and summary, plus the three images.
interface Finding { code: string; name: string; props: string[]; hint: string; pixels: number; area: number; severity: number; sample?: { design: string; built: string } }
interface ParityCell { label: string; state: string; row: number; col: number; pct: number; findings: Finding[] }
interface ParityOk {
  ok: true; slug: string; theme: string; pass: number; scale: number;
  cell: { w: number; h: number }; cols: string[]; rows: string[]; cells: ParityCell[];
  summary: { total: number; failing: number; byState: [string, number][]; suspicious: [string, number][]; median: number; codes: (Finding & { state: string; rows: number; worst: number })[] };
  sheet: { path: string; shotAt: string };
  images: { design: string; built: string; diff: string };
  // The play pass: every closed cell clicked, then scored against the design's open column.
  behaviour?: { from: string; to: string; clicked: number; rows: { label: string; pct: number; findings: Finding[] }[]; after: string } | { error: string } | null;
}
interface ParityRefused { ok: false; reason: string; message?: string; command?: string; theme?: string }
type ParityResponse = ParityOk | ParityRefused;

// What /__extract/run answers, kept beside the registered draft component.
interface Draft {
  slug: string; name: string;
  fidelity: { boundVariables: number; resolvedVariables: number; missingVariables: string[]; note: string | null };
  notes: { id: string; confidence: string | null; question: string; chose: string | null; fix: string | null }[];
  onDisk: { defs: boolean; evidence: boolean; code: boolean; spec: string | null };
  evidence: any;
  saved?: { evidence?: { status: string; path: string }; defs?: { status: string; path: string; note?: string } | null; code?: { status: string; path?: string; line?: string; error?: string } };
}

interface TreeNode { nodeId: string; name?: string; kind: string; slug?: string | null; depth?: number; error?: string; variants?: number; deps: { nodeId: string; name: string }[]; onDisk?: { defs: boolean; contract: boolean; code: boolean; spec: string | null } | null; evidence?: any; made?: string }
interface TreeResult { ok: true; fileKey: string; root: string; order: string[]; nodes: Record<string, TreeNode> }

const pascal = (s: string) => s.split(/[^a-z0-9]+/i).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
const kb = (s: string) => `${(new TextEncoder().encode(s).length / 1024).toFixed(1)} KB`;
const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;

@customElement("contract-book")
export class ContractBook extends LitElement {
  // Light DOM: the stylesheet is global.
  protected createRenderRoot() { return this; }

  // Button is the worked example — fully curated, real code, a State axis, a
  // golden sheet — so it opens first.
  @state() private slug: string = (contracted.find((c) => c.slug === "button") ?? contracted[0])?.slug ?? "";
  @state() private text = "";
  @state() private parsed: unknown = null;
  @state() private parseError: string | null = null;
  @state() private result: BuildResult | null = null;
  @state() private tab: OutputTab = "render";
  @state() private dirty = false;

  // The Render tab: Storybook's frame, and whether Storybook is there at all.
  @state() private renderTheme: "light" | "dark" = "light";
  @state() private storybookUp: boolean | null = null;

  // Parity: one run per click, flagged stale as soon as the defs change again.
  @state() private parity: ParityResponse | null = null;
  @state() private parityBusy = false;
  @state() private parityTheme: "light" | "dark" = "light";
  @state() private parityStale = false;
  /** Where the overlay's wipe sits, 0 = all design, 100 = all built. */
  @state() private parityWipe = 50;
  @state() private parityCell: number | null = null;
  @state() private healing = false;
  @state() private healLog: HealStep[] = [];
  @state() private healNote: string | null = null;

  /**
   * Which design system an extraction is for.
   *
   * The slug comes from the Figma set's name, and two systems can use the same
   * one — Adobe's Spectrum 2 Button is called "Button", and so is ours. Without
   * this the rail could only draft against our tree, so pasting a Spectrum link
   * produced a replacement for our own component.
   */
  @state() private extractSystem = "s2a";

  // Extraction: the link field, and the draft it produced (one at a time).
  @state() private figmaUrl = "";
  @state() private extracting = false;
  @state() private extractError: string | null = null;
  @state() private draft: Draft | null = null;
  @state() private saving = false;
  @state() private savedNote: string | null = null;

  // The tree behind a link: every set it composes, leaves first.
  @state() private tree: TreeResult | null = null;
  @state() private treeBusy: "crawl" | "contract" | null = null;
  @state() private treeLog: string[] = [];

  private debounce = 0;

  connectedCallback() {
    super.connectedCallback();
    const url = new URL(location.href);
    const want = url.searchParams.get("c");
    if (want && contracted.some((c) => c.slug === want)) this.slug = want;
    this.load(this.slug);
    // Reachability only: an opaque response means something answered.
    fetch(`${STORYBOOK}/iframe.html`, { mode: "no-cors" }).then(() => { this.storybookUp = true; }, () => { this.storybookUp = false; });
  }

  /**
   * The component's own slug, without the Book's system prefix. The renderer
   * names its files and exports from this, so every lookup has to agree.
   */
  private bare(slug = this.slug) { return slug.includes(":") ? slug.split(":")[1] : slug; }

  /** Storybook derives the id from "<Title>/<PascalName>": Generated/ControlButton → generated-controlbutton. */
  private storyId(story = "default") { return `${storyPrefixOf(this.slug)}-${this.bare().replace(/-/g, "")}--${story}`; }

  private load(slug: string) {
    const c = components.find((k) => k.slug === slug);
    if (!c?.defs) return;
    this.slug = slug;
    this.text = JSON.stringify(c.defs, null, 2);
    this.dirty = false;
    this.parity = null; this.parityCell = null; this.parityStale = false;
    this.healLog = []; this.healNote = null;
    this.savedNote = null;
    const url = new URL(location.href); url.searchParams.set("c", slug); history.replaceState(null, "", url);
    this.recompute();
  }

  private onEdit(e: Event) {
    this.text = (e.target as HTMLTextAreaElement).value;
    this.dirty = true;
    this.parityStale = Boolean(this.parity);
    clearTimeout(this.debounce);
    this.debounce = window.setTimeout(() => this.recompute(), 250);
  }

  private recompute() {
    try {
      this.parsed = JSON.parse(this.text);
      this.parseError = null;
    } catch (e) {
      this.parsed = null;
      this.parseError = e instanceof Error ? e.message : String(e);
      this.result = null;
      return;
    }
    this.result = build(this.slug, this.parsed);
  }

  private litFile(suffix: string): string | undefined {
    return this.result?.rendered.lit?.[`apps/storybook/stories/generated/${pascal(this.bare())}${suffix}`];
  }

  private jumpTo(path: string) {
    // A refusal names a JSON pointer; find its first key in the text and put
    // the cursor there. Not exact for arrays, but it lands on the right block.
    const key = path.split("/").filter(Boolean).filter((s) => !/^\d+$/.test(s)).pop();
    const ta = this.querySelector<HTMLTextAreaElement>(".editor__text");
    if (!ta || !key) return;
    const idx = this.text.indexOf(`"${key}"`);
    if (idx < 0) return;
    ta.focus();
    ta.setSelectionRange(idx, idx + key.length + 2);
    const line = this.text.slice(0, idx).split("\n").length;
    ta.scrollTop = Math.max(0, (line - 6) * 19.5);
  }

  // ── parity ──────────────────────────────────────────────────────────────
  // Scores what Storybook renders — the build on disk — against the golden
  // sheet. Unsaved edits are not in it: save, let the build run, score again.
  private async runParity() {
    if (!this.result?.manifest?.matrix) return;
    this.parityBusy = true;
    try {
      const res = await fetch("/__parity/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: this.slug, theme: this.parityTheme }),
      });
      this.parity = await res.json();
      this.parityCell = null;
      this.parityStale = this.dirty;
    } catch (e) {
      this.parity = { ok: false, reason: "error", message: e instanceof Error ? e.message : String(e) };
    } finally {
      this.parityBusy = false;
    }
  }

  // ── heal ────────────────────────────────────────────────────────────────
  // Score once, then fix one thing the evidence supports at a time. Each step
  // edits the defs in the editor (never disk) and leaves a decision. The score
  // is of what is built, so it does not move until the defs are saved and
  // rebuilt — the log says "save to rescore" rather than pretending otherwise.
  private scoreLine(): string {
    const p = this.parity;
    if (!p?.ok) return "—";
    const s = p.summary;
    return `${s.total - s.failing}/${s.total}${s.suspicious.length ? ` · ${s.suspicious.map(([st]) => `"${st}" suspicious`).join(", ")}` : ""}`;
  }

  private async heal() {
    if (this.healing || !this.parsed) return;
    this.healing = true;
    this.healLog = [];
    this.healNote = null;
    try {
      const scorable = Boolean(this.result?.ok && this.result?.manifest?.matrix);
      if (scorable && !this.parity) await this.runParity();
      // Parity refusing (no sheet, no Storybook) is not the end of healing:
      // the fixers that read only the defs and the refusals — an unshipped
      // token, an unresolved icon — still run; the ones that need a score wait.
      if (scorable && !this.parity?.ok) this.healNote = this.parity && "message" in this.parity ? `parity did not run (${this.parity.message ?? this.parity.reason}); healing from the defs and refusals only` : "no parity result";
      for (let i = 1; i <= 6; i++) {
        const c = components.find((k) => k.slug === this.slug);
        const patch = await nextPatch({ slug: this.slug, defs: this.parsed, evidence: c?.figma, parity: this.parity?.ok ? { rows: this.parity.rows, summary: this.parity.summary } : null, refusals: this.result?.refusals ?? [] });
        const before = this.scoreLine();
        if (!patch) {
          const s = this.parity?.ok ? this.parity.summary : null;
          const fails = this.result?.refusals.filter((r) => r.severity === "fail").length ?? 0;
          this.healNote = s && s.failing === 0 && !s.suspicious.length && i === 1
            ? `nothing left to heal — ${before}`
            : !s && !fails ? "no refusals left; nothing to score here (no golden sheet or no matrix)"
            : i > 1 ? `no fixer has more to say; save the defs and run parity to see the new score`
            : `no fixer has evidence for what remains (${s ? before : `${fails} refusal${fails === 1 ? "" : "s"}`}); the rest is a decision for a person`;
          break;
        }
        this.text = JSON.stringify(patch.defs, null, 2);
        this.dirty = true;
        this.parityStale = Boolean(this.parity);
        this.recompute();
        await this.updateComplete;
        const fails = this.result?.refusals.filter((r) => r.severity === "fail").length ?? 0;
        this.healLog = [...this.healLog, { iteration: i, patch, before, after: this.result?.ok ? "save to rescore" : `${fails} refusal${fails === 1 ? "" : "s"}` }];
      }
    } finally {
      this.healing = false;
    }
  }

  // ── extraction ──────────────────────────────────────────────────────────
  private async extract() {
    if (!this.figmaUrl.trim() || this.extracting) return;
    this.extracting = true;
    this.extractError = null;
    try {
      const res = await fetch("/__extract/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: this.figmaUrl, system: this.extractSystem }) });
      const out = await res.json();
      if (!out.ok) { this.extractError = out.message ?? out.reason; return; }
      // Register it as a component the engine can build — in memory, until Save.
      const existing = components.find((c) => c.slug === out.slug);
      const record: Component = {
        slug: out.slug, name: out.name, contracted: true, draft: true,
        defs: out.defs, figma: out.evidence,
        code: out.code ?? existing?.code ?? null, contract: existing?.contract ?? null, hasCode: Boolean(out.onDisk.code),
      };
      registerDraft(record);
      this.draft = { slug: out.slug, name: out.name, fidelity: out.fidelity, notes: out.notes, onDisk: out.onDisk, evidence: out.evidence };
      this.load(out.slug);
      this.tab = "evidence";
    } catch (e) {
      this.extractError = e instanceof Error ? e.message : String(e);
    } finally {
      this.extracting = false;
    }
  }

  // ── the tree ────────────────────────────────────────────────────────────
  // A parent's contract composes its children's, so the children come first.
  // Crawl shows the tree and what each set already has; Contract runs draft →
  // save → build down the order, skipping what is contracted, and reloads.
  private async crawl() {
    if (!this.figmaUrl.trim() || this.treeBusy) return;
    this.treeBusy = "crawl"; this.extractError = null; this.tree = null; this.treeLog = [];
    try {
      const res = await fetch("/__extract/crawl", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: this.figmaUrl, system: this.extractSystem }) });
      const out = await res.json();
      if (!out.ok) { this.extractError = out.message ?? out.reason; return; }
      this.tree = out;
    } catch (e) {
      this.extractError = e instanceof Error ? e.message : String(e);
    } finally {
      this.treeBusy = null;
    }
  }

  private async contractTree() {
    const t = this.tree;
    if (!t || this.treeBusy) return;
    this.treeBusy = "contract"; this.treeLog = [];
    const log = (line: string) => { this.treeLog = [...this.treeLog, line]; };
    const post = async (path: string, body: unknown) => (await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })).json();
    try {
      for (const id of t.order) {
        const n = t.nodes[id];
        if (n.kind !== "set") { log(`skip ${id}: ${n.kind}`); continue; }
        if (!n.slug || n.name?.startsWith(".")) { log(`skip ${n.name}: ${n.slug ? "hidden set, belongs to its parent" : "no slug"}`); continue; }
        if (n.onDisk?.contract && id !== t.root) { log(`have ${n.name} → ${n.slug}`); n.made = "have"; continue; }
        const d = await post("/__extract/draft", { evidence: n.evidence, slug: n.slug, system: this.extractSystem });
        if (!d.ok) { log(`FAIL ${n.name}: draft — ${d.message ?? d.reason}`); n.made = "fail"; continue; }
        const s = await post("/__extract/save", { slug: d.slug, evidence: d.evidence, defs: d.defs, overwriteDefs: id === t.root, build: true, system: this.extractSystem });
        if (!s.ok) { log(`FAIL ${n.name}: save — ${s.message}`); n.made = "fail"; continue; }
        n.made = s.build?.status === "built" ? "made" : "fail";
        log(`${n.made === "made" ? "made" : "FAIL"} ${n.name} → ${d.slug}: defs ${s.defs?.status}, ${s.build?.status ?? "not built"}${s.build?.status !== "built" && s.build?.line ? ` — ${s.build.line}` : ""}`);
        this.tree = { ...t };
      }
      const root = t.nodes[t.root];
      log(`done — the Book reloads from disk in a moment${root?.slug ? `, on ${root.slug}` : ""}`);
      if (root?.slug) { const url = new URL(location.href); url.searchParams.set("c", root.slug); history.replaceState(null, "", url); }
    } finally {
      this.treeBusy = null;
    }
  }

  private async saveDraft(overwriteDefs = false) {
    const d = this.draft;
    if (!d || this.saving || this.parseError) return;
    this.saving = true;
    try {
      const res = await fetch("/__extract/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: d.slug, evidence: d.evidence, defs: this.parsed, overwriteDefs, system: this.extractSystem }),
      });
      const out = await res.json();
      if (!out.ok) { this.extractError = out.message; return; }
      // The data plugin watches the component tree; the write it just made
      // triggers a full reload, and the page comes back on this slug from disk.
      this.draft = { ...d, saved: { evidence: out.evidence, defs: out.defs, code: out.code } };
    } catch (e) {
      this.extractError = e instanceof Error ? e.message : String(e);
    } finally {
      this.saving = false;
    }
  }

  // An on-disk defs, edited here (by hand or by Heal): write it back. The
  // build runs, the stories regenerate, Storybook picks them up, and the data
  // plugin's watcher reloads this page from disk a moment later.
  private async saveDefs() {
    if (this.saving || this.parseError || !this.dirty) return;
    this.saving = true;
    try {
      const res = await fetch("/__extract/save-defs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: this.slug, defs: this.parsed }) });
      const out = await res.json();
      this.savedNote = out.ok
        ? `saved → ${out.defs.path}${out.build ? ` · ${out.build.status}${out.build.line ? `: ${out.build.line}` : ""}` : ""}`
        : `save failed: ${out.message}`;
      if (out.ok) this.dirty = false;
    } catch (e) {
      this.savedNote = `save failed: ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this.saving = false;
    }
  }

  // ── render ──────────────────────────────────────────────────────────────
  render() {
    const r = this.result;
    const fails = r?.refusals.filter((x) => x.severity === "fail").length ?? 0;
    const warns = r?.refusals.filter((x) => x.severity === "warn").length ?? 0;
    return html`
      <header class="topbar">
        <span class="topbar__brand"><img src="${import.meta.env.BASE_URL}contract-book-icon.svg" alt="" width="22" height="22">Contract Book</span>
        <span class="topbar__sub">${STATIC ? "a read-only snapshot of the contract loop, hosted from main" : "the contract loop, on this repo's own components"}</span>
        <span class="topbar__spacer"></span>
        <span class="topbar__meta">${contracted.length} contracted · ${components.length} in library · read ${new Date(capturedAt).toLocaleTimeString()}</span>
      </header>
      <div class="pg">
        ${this.renderRail()}
        <div class="pg__gutter"></div>
        ${this.renderEditor(fails, warns)}
        <div class="pg__gutter"></div>
        ${this.renderOutput(fails, warns)}
      </div>`;
  }

  private renderRail() {
    const uncontracted = components.filter((c) => !c.contracted);
    return html`
      <aside class="pane pane--rail">
        <div class="pane__head"><span class="pane__title">Library</span></div>
        <div class="pane__body">
          <div class="rail__group">From Figma</div>
          ${STATIC ? html`<div class="rail__form"><span class="rail__hint">${STATIC_NOTE}</span></div>` : html`<form class="rail__form" @submit=${(e: Event) => { e.preventDefault(); this.extract(); }}>
            <input type="url" placeholder="https://www.figma.com/design/…?node-id=…" .value=${this.figmaUrl}
              @input=${(e: Event) => { this.figmaUrl = (e.target as HTMLInputElement).value; }} ?disabled=${this.extracting}>
            <div class="row">
              <button class="btn btn--primary" type="submit" ?disabled=${this.extracting || Boolean(this.treeBusy) || !this.figmaUrl.trim()}>
                ${this.extracting ? html`<span class="spin"></span> Extracting…` : "Extract"}</button>
              <button class="btn" type="button" @click=${() => this.crawl()} ?disabled=${this.extracting || Boolean(this.treeBusy) || !this.figmaUrl.trim()} title="Every set this one composes, to the leaves">
                ${this.treeBusy === "crawl" ? html`<span class="spin spin--dark"></span> Crawling…` : "Crawl tree"}</button>
            </div>
            <label class="rail__target">into
              <select .value=${this.extractSystem} ?disabled=${this.extracting || Boolean(this.treeBusy)}
                @change=${(e: Event) => { this.extractSystem = (e.target as HTMLSelectElement).value; }}
                title="Which design system this extraction belongs to. Two systems can name a set the same thing, so the target is chosen here rather than guessed from the name.">
                ${systems.map((sys) => html`<option value=${sys.id} ?selected=${this.extractSystem === sys.id}>${sys.label}</option>`)}
              </select>
            </label>
            <span class="rail__hint">a component set's link; REST, so it needs <code>FIGMA_ACCESS_TOKEN</code> in <code>.env</code></span>
          </form>`}
          ${this.extractError ? html`<div class="rail__err">${this.extractError}</div>` : nothing}
          ${this.tree ? this.renderTree(this.tree) : nothing}

          ${systems.map((sys) => html`
          <div class="rail__group">${sys.label} · ${sys.items.length}</div>
          ${sys.items.map((c) => {
            const probe = c.slug === this.slug ? this.result : build(c.slug, c.defs);
            const f = probe?.refusals.filter((x) => x.severity === "fail").length ?? 0;
            const w = probe?.refusals.filter((x) => x.severity === "warn").length ?? 0;
            return html`<button class="rail__item ${c.slug === this.slug ? "is-active" : ""}" @click=${() => this.load(c.slug)}>
              <span class="dot ${f ? "dot--fail" : w ? "dot--warn" : "dot--ok"}"></span>${c.name}
              ${c.draft ? html`<span class="badge">draft</span>` : nothing}
              <small>${f ? `${f} fail` : w ? `${w} warn` : "clean"}</small></button>`;
          })}`)}
          <div class="rail__group">Spec only · ${uncontracted.length}</div>
          <div class="rail__note">${uncontracted.length} components have a hand-written spec and no contract yet. Paste the set's Figma link above, or extract it in the toolkit, and it appears here.</div>
        </div>
      </aside>`;
  }

  private renderTree(t: TreeResult) {
    const nodes = t.order.map((id) => t.nodes[id]).filter(Boolean);
    const state = (n: TreeNode) => n.kind !== "set" ? n.kind : n.made ?? (n.onDisk?.contract ? "contracted" : n.onDisk?.spec ? "spec-only" : "new");
    const todo = nodes.filter((n) => n.kind === "set" && n.slug && !n.name?.startsWith(".") && !(n.onDisk?.contract && n.nodeId !== t.root)).length;
    return html`<div class="tree">
      <div class="rail__group">Tree · ${nodes.length} sets, leaves first</div>
      ${nodes.map((n) => html`<div class="tree__node" style="padding-left:${14 + (n.depth ?? 0) * 12}px">
        <span class="dot ${["contracted", "have", "made"].includes(state(n)) ? "dot--ok" : state(n) === "fail" ? "dot--fail" : state(n) === "new" || state(n) === "spec-only" ? "dot--warn" : ""}"></span>
        <span class="tree__name">${n.name ?? n.nodeId}</span>
        <small>${state(n)}${n.variants ? ` · ${n.variants}` : ""}</small></div>`)}
      <div class="rail__form"><div class="row">
        <button class="btn btn--primary" @click=${() => this.contractTree()} ?disabled=${Boolean(this.treeBusy) || !todo}>
          ${this.treeBusy === "contract" ? html`<span class="spin"></span> Contracting…` : `Contract ${todo} (leaves first)`}</button>
      </div></div>
      ${this.treeLog.length ? html`<div class="tree__log">${this.treeLog.map((l) => html`<div class=${l.startsWith("FAIL") ? "fail" : ""}>${l}</div>`)}</div>` : nothing}
    </div>`;
  }

  private renderEditor(fails: number, warns: number) {
    const status = this.parseError
      ? html`<span class="editor__status--fail">not JSON — ${this.parseError}</span>`
      : fails ? html`<span class="editor__status--fail">${fails} refusal${fails === 1 ? "" : "s"} — the contract is not derived until these are resolved</span>`
      : warns ? html`<span class="editor__status--warn">valid · ${warns} warning${warns === 1 ? "" : "s"}</span>`
      : html`<span class="editor__status--ok">valid · every surface derived</span>`;
    const d = this.draft?.slug === this.slug ? this.draft : null;
    return html`
      <section class="pane">
        <div class="pane__head">
          <span class="pane__title">Defs</span>
          <span class="topbar__meta">${this.slug}.defs.json${d ? " · draft" : this.dirty ? " · edited" : ""}</span>
          <span class="topbar__spacer"></span>
          ${STATIC
            ? html`<span class="topbar__meta" title=${STATIC_NOTE}>read-only · edits derive live but cannot be saved here</span>`
            : d
            ? html`<button class="btn btn--ghost" @click=${() => location.reload()}>Discard</button>
                   <button class="btn btn--primary" @click=${() => this.saveDraft(false)} ?disabled=${this.saving || Boolean(this.parseError) || Boolean(d.saved)}>
                     ${this.saving ? "Saving…" : d.onDisk.defs ? "Save evidence" : "Save to repo"}</button>`
            : html`<button class="btn btn--ghost" @click=${() => this.load(this.slug)} ?disabled=${!this.dirty}>Reset</button>
                   <button class="btn btn--primary" @click=${() => this.saveDefs()} ?disabled=${!this.dirty || this.saving || Boolean(this.parseError)} title="Write the defs, run this system's build, regenerate the stories">${this.saving ? "Saving…" : "Sign off"}</button>`}
        </div>
        ${d ? this.renderDraftBanner(d) : nothing}
        ${!d && this.savedNote ? html`<div class="banner banner--ok"><b>Saved.</b> ${this.savedNote}</div>` : nothing}
        <div class="pane__body editor">
          <div class="editor__wrap">
            <textarea class="editor__text" spellcheck="false" .value=${this.text} @input=${this.onEdit}></textarea>
          </div>
        </div>
        <div class="pane__foot">${status}</div>
      </section>`;
  }

  private renderDraftBanner(d: Draft) {
    const ev = d.evidence;
    const low = d.notes.filter((n) => n.confidence === "low");
    if (d.saved) {
      return html`<div class="banner banner--ok">
        <b>Saved.</b> evidence ${d.saved.evidence?.status} → <code>${d.saved.evidence?.path}</code>
        ${d.saved.defs ? html`· defs ${d.saved.defs.status} → <code>${d.saved.defs.path}</code>${d.saved.defs.note ? html` <i>(${d.saved.defs.note})</i>` : nothing}` : nothing}
        ${d.saved.code ? html`<div>${d.saved.code.status === "extracted"
          ? html`code evidence ${d.saved.code.line ? html`<code>${d.saved.code.line}</code>` : html`→ <code>${d.saved.code.path}</code>`}`
          : html`<span class="banner__warn">code evidence failed: ${d.saved.code.error}</span>`}</div>` : nothing}
        <div class="row">Next: <code>/contract-ship ${d.slug}</code> — validate, build, gate, render, sheet, parity.</div>
      </div>`;
    }
    return html`<div class="banner">
      <b>Draft from Figma</b> — ${ev.set?.name} · ${ev.variants?.length ?? 0} variants · ${ev.bindings?.length ?? 0} bindings ·
      variables ${d.fidelity.resolvedVariables}/${d.fidelity.boundVariables} resolved · archetype <code>${(this.parsed as any)?.archetype ?? "?"}</code>
      ${d.fidelity.note ? html`<div class="banner__warn">${d.fidelity.note}</div>` : nothing}
      ${d.onDisk.defs ? html`<div class="banner__warn">This component already has a defs on disk. Save writes the fresh evidence and keeps the defs; the draft here is for comparison.
        <button class="btn btn--ghost" @click=${() => this.saveDraft(true)} ?disabled=${this.saving}>overwrite defs too</button></div>` : nothing}
      <div>${d.notes.length} draft notes${low.length ? html` · <b>${low.length} low confidence</b>` : nothing} — the scaffolder's guesses, each an open decision in the defs. Nothing is on disk until Save.</div>
      ${low.length ? html`<ul class="notes">${low.slice(0, 4).map((n) => html`<li><code>${n.id}</code>${n.chose ? html` — chose ${n.chose}` : nothing}${n.fix ? html`<br><small>${n.fix}</small>` : nothing}</li>`)}</ul>` : nothing}
    </div>`;
  }

  private renderOutput(fails: number, warns: number) {
    const r = this.result;
    const refusals = r?.refusals ?? [];
    const generated = systemOf(this.slug) === "s2a";
    const tabs = OUTPUT_TABS.filter(([id]) => generated || !GENERATED_TABS.has(id));
    if (!tabs.some(([id]) => id === this.tab) && this.tab !== "refusals") this.tab = "render";
    return html`
      <section class="pane">
        <div class="pane__head">
          <div class="tabs">
            ${tabs.map(([id, label]) => html`<button class="tab ${this.tab === id ? "is-active" : ""}" @click=${() => { this.tab = id; }}>
              ${label}${id === "parity" && this.parity?.ok ? html`<span class="count ${this.parity.summary.failing ? "count--fail" : ""}">${this.parity.summary.total - this.parity.summary.failing}/${this.parity.summary.total}</span>` : nothing}
            </button>`)}
            <button class="tab ${this.tab === "refusals" ? "is-active" : ""}" @click=${() => (this.tab = "refusals")}>
              Refusals ${fails || warns ? html`<span class="count ${fails ? "count--fail" : "count--warn"}">${fails || warns}</span>` : nothing}
            </button>
          </div>
          <span class="topbar__spacer"></span>
          <a class="btn btn--ghost" href="${STORYBOOK}/?path=/story/${this.storyId()}" target="_blank" rel="noopener" title="This component in Storybook — every story, with controls and the design overlay">Storybook ↗</a>
        </div>
        <div class="pane__body">${this.renderTab(r, refusals)}</div>
      </section>`;
  }

  private renderTab(r: BuildResult | null, refusals: Refusal[]): TemplateResult {
    const tab = this.tab;
    if (tab === "refusals") return this.renderRefusals(refusals);
    if (tab === "evidence") return this.renderEvidence();
    if (tab === "render") return this.renderRender();
    if (!r?.ok && tab === "parity") return html`<div class="parity">
      <div class="parity__bar">
        ${STATIC ? nothing : html`<button class="btn" @click=${() => this.heal()} ?disabled=${this.healing}>${this.healing ? html`<span class="spin spin--dark"></span> Healing…` : "Heal"}</button>`}
        <span class="editor__status--fail">the defs does not derive yet — Heal works through the refusals it has evidence for; the rest are yours</span>
      </div>
      ${this.healLog.length || this.healNote ? this.renderHealLog() : nothing}
    </div>`;
    if (!r?.ok) return html`<div class="empty">Nothing to show — the defs has to be valid before anything is derived.<br><small>Open <b>Refusals</b> to see what stopped it.</small></div>`;
    const files = (map: Record<string, string>) => html`<div class="output__files">${Object.entries(map).map(([path, body]) => html`
      <div class="output__file"><div class="output__filehead">${path}<span class="size">${kb(body)}</span></div><pre class="output__code">${body}</pre></div>`)}</div>`;
    switch (tab) {
      case "parity": return this.renderParity(r);
      case "contract": return html`<pre class="output__code">${r.artifacts[`${this.slug}.contract.json`]}</pre>`;
      case "spec": return html`<pre class="output__code">${r.artifacts[`${this.slug}.spec.md`]}</pre>`;
      case "css": return html`<pre class="output__code">${this.litFile(".css") ?? ""}</pre>`;
      case "lit": return files(Object.fromEntries(Object.entries(r.rendered.lit ?? {}).filter(([p]) => !p.endsWith(".css"))));
      case "milo": return files(r.rendered.milo ?? {});
      case "figma": return html`<pre class="output__code">${r.artifacts["figma.plan.json"]}</pre>`;
    }
    return html``;
  }

  /**
   * The component, as Storybook has it: the build on disk, in Storybook's own
   * frame. Not interactive — the controls, the story index and the design
   * overlay are Storybook's; the link in the corner opens them.
   */
  private renderRender() {
    const id = this.storyId();
    const globals = `figmaOverlay:off;theme:${this.renderTheme}`;
    const src = `${STORYBOOK}/iframe.html?id=${id}&viewMode=story&globals=${encodeURIComponent(globals)}`;
    const generated = systemOf(this.slug) === "s2a";
    return html`
      <div class="render">
        <div class="render__bar">
          <span class="topbar__meta">${id}</span>
          <select @change=${(e: Event) => { this.renderTheme = (e.target as HTMLSelectElement).value as "light" | "dark"; }}>
            <option value="light" ?selected=${this.renderTheme === "light"}>light</option>
            <option value="dark" ?selected=${this.renderTheme === "dark"}>dark</option>
          </select>
          <span class="topbar__spacer"></span>
          <span class="topbar__meta">${this.dirty ? html`<span class="editor__status--warn">showing the last build — sign off to rebuild</span>` : generated ? "the generated component, as built" : "the library's own element, as it ships"}</span>
        </div>
        ${this.storybookUp === false
          ? html`<div class="empty">Storybook is not running at <code>${STORYBOOK}</code>.<br><small>Start it with <code>npm run storybook</code>; this frame is its <code>${id}</code> story.</small></div>`
          : html`<iframe class="render__frame" src=${src} title="${id} in Storybook" loading="lazy"></iframe>`}
      </div>`;
  }

  private renderParity(r: BuildResult) {
    const matrix = r.manifest?.matrix;
    if (!matrix) return html`<div class="empty">No State axis — nothing to score.<br><small>Parity runs on the State matrix story, and this set has no State axis, so there is no matrix and no golden sheet for it.</small></div>`;
    const p = this.parity;
    return html`
      <div class="parity">
        <div class="parity__bar">
          <select @change=${(e: Event) => { this.parityTheme = (e.target as HTMLSelectElement).value as "light" | "dark"; }} ?disabled=${this.parityBusy}>
            <option value="light" ?selected=${this.parityTheme === "light"}>light</option>
            <option value="dark" ?selected=${this.parityTheme === "dark"}>dark</option>
          </select>
          ${STATIC ? html`<span class="editor__status--warn">${STATIC_NOTE}</span>` : html`<button class="btn btn--primary" @click=${() => this.runParity()} ?disabled=${this.parityBusy || this.healing}>
            ${this.parityBusy && !this.healing ? html`<span class="spin"></span> Scoring…` : p ? "Run again" : "Run parity"}</button>
          <button class="btn" @click=${() => this.heal()} ?disabled=${this.parityBusy || this.healing} title="Score, then fix what the evidence supports — one patch at a time, in the editor">
            ${this.healing ? html`<span class="spin spin--dark"></span> Healing…` : "Heal"}</button>`}
          <span class="topbar__meta">${matrix.rows.length} × ${matrix.cols.length} cells · pass &lt; 8%</span>
          ${this.parityStale ? html`<span class="editor__status--warn">defs edited since this run — sign off to rebuild, then run again</span>` : nothing}
        </div>
        <div class="parity__note">Shoots the State matrix story <b>as Storybook renders it</b> — the build on disk — in headless Chromium at the golden sheet's scale, and scores every cell with <code>evals/visual/matrix-parity.mjs</code>: the same screenshot routine, comparison and difference codes as <code>npm run eval:visual:matrix</code>.</div>
        ${this.healLog.length || this.healNote ? this.renderHealLog() : nothing}
        ${!p ? nothing : !p.ok ? this.renderParityRefused(p) : this.renderParityResult(p)}
      </div>`;
  }

  private renderHealLog() {
    return html`<div class="heal">
      ${this.healLog.map((h) => html`<div class="heal__step">
        <div class="heal__head"><span class="badge">pass ${h.iteration}</span><span class="heal__score">${h.before} → ${h.after ?? "…"}</span></div>
        <div class="heal__row"><span class="heal__k">finding</span><span>${h.patch.finding}</span></div>
        <div class="heal__row"><span class="heal__k">fixer</span><span><code>${h.patch.fixer}</code> — ${h.patch.change}</span></div>
        <div class="heal__row"><span class="heal__k">evidence</span><span class="muted">${h.patch.evidence}</span></div>
      </div>`)}
      ${this.healNote ? html`<div class="heal__note">${this.healNote}</div>` : nothing}
    </div>`;
  }

  private renderParityRefused(p: ParityRefused) {
    if (p.reason === "no-sheet") return html`<div class="receipts"><div class="receipt receipt--warn">
      <span class="receipt__tag">golden · missing</span>
      <span class="receipt__msg">No ${p.theme} sheet for this set. Composite one (needs the Figma token, once):<br><code>${p.command}</code></span></div></div>`;
    if (p.reason === "no-storybook") return html`<div class="receipts"><div class="receipt receipt--warn">
      <span class="receipt__tag">storybook · down</span>
      <span class="receipt__msg">${p.message}. Parity scores what Storybook renders, so it needs one:<br><code>${p.command}</code></span></div></div>`;
    return html`<div class="receipts"><div class="receipt receipt--fail">
      <span class="receipt__tag">parity · ${p.reason}</span><span class="receipt__msg">${p.message}</span></div></div>`;
  }

  private renderParityResult(p: ParityOk) {
    const s = p.summary;
    const suspect = new Set(s.suspicious.map(([state]) => state));
    const cw = p.cell.w, ch = p.cell.h, W = p.cols.length * cw, H = p.rows.length * ch;
    const sel = this.parityCell != null ? p.cells[this.parityCell] : null;
    const crop = (img: string, c: ParityCell) => `width:${cw}px;height:${ch}px;background-image:url(${img});background-size:${W}px ${H}px;background-position:-${c.col * cw}px -${c.row * ch}px`;
    return html`
      <div class="parity__summary">
        <span class="${s.failing ? "fail" : "ok"}">${s.total - s.failing}/${s.total} cells within ${pct(p.pass, 0)}</span>
        ${s.byState.map(([state, n]) => html`<br><span class="fail">${n}/${p.rows.length} rows fail in "${state}"</span>${n === p.rows.length ? html` <span class="muted">← every row: one missing rule, not ${n} bugs</span>` : nothing}`)}
        ${s.suspicious.map(([state, m]) => html`<br><span class="warn">! "${state}" averages ${pct(m)} against a ${pct(s.median)} baseline in every row — under the bar, but that is the shape of a detail missing everywhere (a ring, a shadow), not noise.</span>`)}
      </div>
      <div class="pgrid" style="grid-template-columns: auto repeat(${p.cols.length}, 1fr)">
        <div></div>${p.cols.map((c) => html`<div class="pgrid__h">${c}</div>`)}
        ${p.rows.map((label, ri) => html`<div class="pgrid__r">${label}</div>${p.cols.map((_, ci) => {
          const i = ri * p.cols.length + ci; const c = p.cells[i];
          return html`<button class="pcell ${c.pct > p.pass ? "pcell--fail" : suspect.has(c.state) ? "pcell--suspect" : ""} ${this.parityCell === i ? "is-active" : ""}"
            @click=${() => { this.parityCell = this.parityCell === i ? null : i; }} title=${c.label}>${pct(c.pct)}</button>`;
        })}`)}
      </div>
      ${sel ? html`<div class="pdetail">
        <div class="topbar__meta">${sel.label} — ${pct(sel.pct)} of the cell differs${sel.pct > p.pass ? " · FAIL" : ""}</div>
        <div class="pdetail__crops">
          <div class="crop">design<i style=${crop(p.images.design, sel)}></i></div>
          <div class="crop">built<i style=${crop(p.images.built, sel)}></i></div>
          <div class="crop">diff<i style=${crop(p.images.diff, sel)}></i></div>
          <!--
            The same two crops stacked, with the top one clipped by the slider.
            Three panels side by side answer "do these differ"; a wipe answers
            "by how much, and where", which is the question a percentage cannot.
            Both images are already in the response, so this costs one slider.
          -->
          <div class="crop">overlay · drag to wipe
            <div class="wipe" style="width:${cw}px;height:${ch}px">
              <i style=${crop(p.images.design, sel)}></i>
              <i class="wipe__top" style="${crop(p.images.built, sel)};clip-path:inset(0 0 0 ${this.parityWipe}%)"></i>
              <span class="wipe__seam" style="left:${this.parityWipe}%"></span>
            </div>
            <input class="wipe__range" type="range" min="0" max="100" .value=${String(this.parityWipe)}
              style="width:${cw}px"
              @input=${(e: Event) => { this.parityWipe = Number((e.target as HTMLInputElement).value); }}>
            <span class="wipe__ends">design ← → built</span>
          </div>
        </div>
        ${sel.findings.length ? sel.findings.map((f) => this.renderFinding(f)) : html`<div class="topbar__meta">no difference above the noise floor in any region</div>`}
      </div>` : nothing}
      ${this.renderBehaviour(p)}
      <div class="pcodes">
        <h4>differences by code</h4>
        ${s.codes.length ? s.codes.map((c) => this.renderFinding(c, `${c.rows}/${p.rows.length} rows in "${c.state}" · worst ${pct(c.worst)} of the cell`)) : html`<div class="topbar__meta">none above the noise floor</div>`}
        <div class="topbar__meta">golden <code>${p.sheet.path}</code> · shot ${new Date(p.sheet.shotAt).toLocaleString()} · ${p.theme} · ${p.scale}×</div>
      </div>`;
  }

  // Static parity can pass while the component does nothing: a disclosure
  // that only moves its chevron matches both columns and still never opens.
  // So the eval plays: it clicks every closed cell and compares what appears
  // with the design's open artwork for the same row.
  private renderBehaviour(p: ParityOk) {
    const b = p.behaviour;
    if (!b) return nothing;
    if ("error" in b) return html`<div class="pcodes"><h4>behaviour</h4><div class="topbar__meta fail">play pass failed: ${b.error}</div></div>`;
    const ok = b.rows.filter((r) => r.pct <= p.pass).length;
    const cw = p.cell.w, ch = p.cell.h, W = p.cols.length * cw, H = p.rows.length * ch;
    const openCol = p.cols.indexOf(b.to), closedCol = p.cols.indexOf(b.from);
    const crop = (img: string, col: number, row: number) => `width:${cw}px;height:${ch}px;background-image:url(${img});background-size:${W}px ${H}px;background-position:-${col * cw}px -${row * ch}px`;
    return html`<div class="pcodes pbehaviour">
      <h4>behaviour</h4>
      <div class="topbar__meta">clicked the trigger in every "${b.from}" cell, then compared with the design's "${b.to}" —
        <span class="${ok === b.rows.length ? "ok" : "fail"}">${ok}/${b.rows.length} rows within ${pct(p.pass, 0)}</span></div>
      ${b.rows.map((r, ri) => html`<div class="pbehaviour__row ${r.pct > p.pass ? "is-fail" : ""}">
        <span class="pbehaviour__label">${r.label} <b>${pct(r.pct)}</b></span>
        <div class="crop">design · ${b.to}<i style=${crop(p.images.design, openCol, ri)}></i></div>
        <div class="crop">built · ${b.from}<i style=${crop(p.images.built, closedCol, ri)}></i></div>
        <div class="crop">built · after click<i style=${crop(b.after, closedCol, ri)}></i></div>
      </div>`)}
    </div>`;
  }

  private renderFinding(f: Finding, meta?: string) {
    return html`<div class="finding">
      <span class="finding__code">${f.code} ${f.name}</span>
      <span>${f.hint}</span>
      <span class="finding__meta">${meta ?? `${pct(f.area)} of the cell · severity ${pct(f.severity, 0)}`}${f.sample ? ` · e.g. design ${f.sample.design} vs built ${f.sample.built}` : ""} · look at: ${f.props.join(", ")}</span>
    </div>`;
  }

  private renderRefusals(refusals: Refusal[]) {
    if (!refusals.length) return html`<div class="receipts__empty">No refusals.<small>Schema-valid, every code prop curated, every token shipped, every direct dependency ruled on.</small></div>`;
    const order = { fail: 0, warn: 1 };
    return html`<div class="receipts">
      ${[...refusals].sort((a, b) => order[a.severity] - order[b.severity]).map((x) => html`
        <div class="receipt receipt--${x.severity}" @click=${() => this.jumpTo(x.path)} title="Jump to ${x.path}">
          <span class="receipt__tag">${x.layer} · ${x.severity}</span>
          <span class="receipt__path">${x.path}</span>
          <span class="receipt__msg">${x.message}</span>
        </div>`)}
    </div>`;
  }

  private renderEvidence() {
    const c = components.find((k) => k.slug === this.slug);
    const f = c?.figma, k = c?.code;
    const d = this.draft?.slug === this.slug ? this.draft : null;
    return html`
      <dl class="kv">
        <dt>figma set</dt><dd>${f ? `${f.set?.name} · ${f.variants?.length ?? 0} variants · ${f.bindings?.length ?? 0} bindings · ${f.instances?.length ?? 0} instances` : "not extracted"}</dd>
        <dt>axes</dt><dd>${f ? (f.axes ?? []).map((a: any) => `${a.name}${a.options ? `[${a.options.join("|")}]` : ""}`).join("  ") : "—"}</dd>
        <dt>unbound paint</dt><dd>${f ? (f.unboundPaint?.length ?? 0) : "—"}</dd>
        <dt>extractor</dt><dd>${f?.extractor ? `${f.extractor.plugin} ${f.extractor.version}` : "—"}</dd>
        <dt>hash</dt><dd><code>${f?.provenance?.hash ?? "—"}</code></dd>
        ${d ? html`<dt>variables</dt><dd>${d.fidelity.resolvedVariables}/${d.fidelity.boundVariables} resolved over REST${d.fidelity.missingVariables.length ? html`<br><small>missing: ${d.fidelity.missingVariables.join(", ")}</small>` : nothing}</dd>` : nothing}
        <dt>code</dt><dd>${k ? `${k.props?.length ?? 0} props · parts ${(k.parts?.template ?? []).join(", ")}${k.stylesheet?.rules ? ` · ${k.stylesheet.rules.length} rules` : ""}` : "no code evidence"}</dd>
        <dt>extracted</dt><dd>${f?.extractedAt ?? "—"}</dd>
      </dl>
      ${d ? html`<div class="pcodes"><h4>draft notes · ${d.notes.length}</h4>
        ${d.notes.map((n) => html`<div class="finding"><span class="finding__code">${n.confidence ?? "—"}</span><span><code>${n.id}</code> ${n.question}${n.chose ? html` — chose <b>${n.chose}</b>` : nothing}</span>${n.fix ? html`<span class="finding__meta">${n.fix}</span>` : nothing}</div>`)}
      </div>` : html`<div class="rail__note">Evidence is observed and never edited here. To refresh it, paste the set's link in the rail, or re-extract in the toolkit.</div>`}`;
  }
}
