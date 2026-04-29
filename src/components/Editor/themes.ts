import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { oneDark, oneDarkHighlightStyle } from '@codemirror/theme-one-dark';

export const mobileEditorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: 'var(--editor-font-size, 13px)',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
  },
  '.cm-scroller': {
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    fontFamily: 'var(--editor-font-family, JetBrains Mono), Fira Code, Consolas, monospace',
  },
  '.cm-content': {
    minHeight: '100%',
    padding: '10px 0',
    caretColor: '#007acc',
    WebkitUserModify: 'read-write-plaintext-only',
  },
  '.cm-line': {
    padding: '0 12px 0 6px',
    lineHeight: '20px',
  },
  '.cm-gutters': {
    backgroundColor: '#1e1e1e',
    borderRight: '0',
    color: '#4a4a4a',
  },
  '.cm-lineNumbers': {
    minWidth: '36px',
    color: '#4a4a4a',
  },
  '.cm-activeLine': {
    backgroundColor: '#282828',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#282828',
    color: '#888888',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: '#264f78',
  },
  '.cm-cursor': {
    borderLeftColor: '#007acc',
  },
  '.cm-foldGutter span': {
    color: '#666666',
  },
  '.cm-tooltip': {
    border: '1px solid #333333',
    backgroundColor: '#252526',
    color: '#d4d4d4',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: '#094771',
    color: '#ffffff',
  },
  '.cm-ghost-text': {
    color: '#777777',
    opacity: '0.85',
    pointerEvents: 'none',
    whiteSpace: 'pre',
  },
});

const lightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#0000ff' },
  { tag: [tags.name, tags.deleted, tags.character, tags.propertyName, tags.macroName], color: '#001080' },
  { tag: [tags.function(tags.variableName), tags.labelName], color: '#795e26' },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: '#0070c1' },
  { tag: [tags.definition(tags.name), tags.separator], color: '#267f99' },
  { tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier], color: '#267f99' },
  { tag: [tags.operator, tags.operatorKeyword], color: '#000000' },
  { tag: [tags.url, tags.escape, tags.regexp, tags.link], color: '#811f3f' },
  { tag: [tags.meta, tags.comment], color: '#008000' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.link, color: '#0000ee', textDecoration: 'underline' },
  { tag: tags.heading, fontWeight: 'bold', color: '#800000' },
  { tag: [tags.atom, tags.bool, tags.special(tags.variableName)], color: '#0000ff' },
  { tag: [tags.processingInstruction, tags.string, tags.inserted], color: '#a31515' },
  { tag: tags.invalid, color: '#cd3131' },
]);

export function getEditorTheme(theme: 'dark' | 'light') {
  if (theme === 'light') {
    return [
      EditorView.theme({
        '&': { backgroundColor: '#ffffff', color: '#1f1f1f' },
        '.cm-gutters': { backgroundColor: '#ffffff', color: '#777777' },
        '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: '#f2f8ff' },
      }),
      syntaxHighlighting(lightHighlightStyle),
    ];
  }

  return [oneDark, syntaxHighlighting(oneDarkHighlightStyle)];
}
