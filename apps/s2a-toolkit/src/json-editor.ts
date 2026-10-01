// json-editor.ts — a real code editor for the contract's JSON mode.
//
// A textarea cannot fold, cannot show you which bracket you are inside, and
// cannot tell you where the syntax error is. A contract is a hundred-odd lines
// of nested JSON that a person has to read and maintain, so it gets the same
// affordances they have everywhere else: line numbers, folding by level,
// bracket matching, syntax colour, and the parse error marked on the line that
// caused it rather than announced in a status bar.
//
// CodeMirror 6, bundled — the plugin iframe has no network, so everything ships
// inside ui.html.

import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, drawSelection, rectangularSelection, crosshairCursor } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { foldGutter, foldKeymap, codeFolding, indentOnInput, bracketMatching, syntaxHighlighting, HighlightStyle, foldAll, unfoldAll, foldEffect, foldable } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { lintGutter, linter, type Diagnostic } from '@codemirror/lint';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { tags as t } from '@lezer/highlight';

// Matches the plugin's own palette (ui.css :root) rather than importing a
// stock theme, so the editor does not read as a foreign widget dropped in.
const highlight = HighlightStyle.define([
  { tag: t.propertyName, color: '#1A1C1E', fontWeight: '600' },
  { tag: t.string, color: '#1C6B48' },
  { tag: t.number, color: '#8A4B16' },
  { tag: t.bool, color: '#4B5CF0' },
  { tag: t.null, color: '#9AA1AC' },
  { tag: t.punctuation, color: '#9AA1AC' },
  { tag: t.invalid, color: '#E5484D' },
]);

const theme = EditorView.theme({
  '&': { fontSize: '11px', backgroundColor: '#FFFFFF', color: '#1A1C1E', border: '1px solid #E4E6EB', borderRadius: '6px', height: '360px' },
  '&.cm-focused': { outline: 'none', boxShadow: '0 0 0 3px rgba(75,92,240,0.18)', borderColor: '#4B5CF0' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', lineHeight: '1.55', overflow: 'auto' },
  '.cm-gutters': { backgroundColor: '#FBFBFC', color: '#9AA1AC', border: 'none', borderRight: '1px solid #E4E6EB' },
  '.cm-activeLineGutter': { backgroundColor: '#F1F3F5', color: '#5B6472' },
  '.cm-activeLine': { backgroundColor: 'rgba(75,92,240,0.04)' },
  '.cm-foldGutter span': { color: '#9AA1AC', padding: '0 2px', cursor: 'pointer' },
  '.cm-foldGutter span:hover': { color: '#4B5CF0' },
  // A folded region should say what it is hiding, not just that it is folded.
  '.cm-foldPlaceholder': { backgroundColor: '#F1F3F5', border: '1px solid #D3D6DB', borderRadius: '3px', color: '#5B6472', padding: '0 4px', margin: '0 2px' },
  '.cm-selectionMatch': { backgroundColor: 'rgba(75,92,240,0.12)' },
  '.cm-lintRange-error': { backgroundImage: 'none', borderBottom: '1.5px solid #E5484D' },
  '.cm-tooltip': { border: '1px solid #D3D6DB', borderRadius: '6px', backgroundColor: '#FFFFFF', fontSize: '11px' },
}, { dark: false });

// preparePlaceholder runs with the document and the folded range, so it is the
// only place that can describe what is being hidden; placeholderDOM only gets
// that description plus the click handler that unfolds it.
const preparePlaceholder = (state: EditorState, range: { from: number; to: number }) => {
  const text = state.doc.sliceString(range.from, Math.min(range.to, range.from + 400));
  const isArray = text.trimStart().startsWith('[');
  // Count only separators at the fold's own depth; commas inside nested objects
  // would otherwise inflate a two-key object into "11 keys".
  let depth = 0, count = 0;
  for (const ch of text) {
    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') depth--;
    else if (ch === ',' && depth === 1) count++;
  }
  const n = count + 1;
  return `${n} ${isArray ? (n === 1 ? 'item' : 'items') : (n === 1 ? 'key' : 'keys')}`;
};

const foldPlaceholder = (_view: EditorView, onclick: (e: Event) => void, prepared: string) => {
  const el = document.createElement('span');
  el.textContent = `… ${prepared ?? ''}`.trim();
  el.title = 'Click to unfold';
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.addEventListener('click', onclick);
  el.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') { e.preventDefault(); onclick(e); } });
  return el;
};

export type JsonEditorHandle = {
  getValue: () => string;
  setValue: (next: string) => void;
  foldAll: () => void;
  unfoldAll: () => void;
  foldToDepth: (depth: number) => void;
  destroy: () => void;
  view: EditorView;
};

export function createJsonEditor(parent: HTMLElement, opts: {
  doc: string;
  onChange: (value: string) => void;
  // Extra problems the parser cannot see — schema errors from the server.
  externalDiagnostics?: () => Diagnostic[];
}): JsonEditorHandle {
  const editable = new Compartment();
  let external: Diagnostic[] = [];

  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: opts.doc,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        codeFolding({ preparePlaceholder, placeholderDOM: foldPlaceholder }),
        foldGutter({ openText: '▾', closedText: '▸' }),
        bracketMatching(),
        closeBrackets(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        rectangularSelection(),
        crosshairCursor(),
        syntaxHighlighting(highlight),
        theme,
        json(),
        lintGutter(),
        // The parser's own errors, plus anything the caller knows about.
        linter((v) => [...jsonParseLinter()(v), ...external]),
        keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...foldKeymap, ...searchKeymap, indentWithTab]),
        editable.of(EditorView.editable.of(true)),
        EditorView.updateListener.of((u) => {
          if (!u.docChanged) return;
          external = opts.externalDiagnostics?.() ?? [];
          opts.onChange(u.state.doc.toString());
        }),
      ],
    }),
  });

  // Fold every region whose indentation puts it below `depth`. Cheaper and more
  // predictable than walking the syntax tree, and it matches how a person
  // thinks about "collapse to the second level".
  const foldToDepth = (depth: number) => {
    unfoldAll(view);
    const effects = [];
    for (let i = 1; i <= view.state.doc.lines; i++) {
      const line = view.state.doc.line(i);
      const indent = line.text.match(/^\s*/)?.[0].length ?? 0;
      if (indent / 2 < depth) continue;
      const range = foldable(view.state, line.from, line.to);
      if (range) effects.push(foldEffect.of(range));
    }
    if (effects.length) view.dispatch({ effects });
  };

  return {
    getValue: () => view.state.doc.toString(),
    setValue: (next) => {
      if (next === view.state.doc.toString()) return;
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
    },
    foldAll: () => foldAll(view),
    unfoldAll: () => unfoldAll(view),
    foldToDepth,
    destroy: () => view.destroy(),
    view,
  };
}
