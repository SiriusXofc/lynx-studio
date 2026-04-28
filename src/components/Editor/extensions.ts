import type { Extension } from '@codemirror/state';
import { EditorState, Prec } from '@codemirror/state';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import {
  bracketMatching,
  foldGutter,
  indentUnit,
} from '@codemirror/language';
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { lintGutter, lintKeymap, linter } from '@codemirror/lint';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import {
  Decoration,
  type DecorationSet,
  drawSelection,
  dropCursor,
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  rectangularSelection,
  crosshairCursor,
  ViewPlugin,
  WidgetType,
} from '@codemirror/view';
import type { DiagnosticsSettings } from '../../types';
import { getDiagnosticsForLanguage } from '../../diagnostics';
import { useEditorStore } from '../../store/editorStore';
import { getEditorTheme, mobileEditorTheme } from './themes';

class GhostTextWidget extends WidgetType {
  private text: string;

  constructor(text: string) {
    super();
    this.text = text;
  }

  toDOM() {
    const span = document.createElement('span');
    span.className = 'cm-ghost-text';
    span.textContent = this.text;
    return span;
  }

  eq(other: GhostTextWidget) {
    return other.text === this.text;
  }
}

function ghostDecorations(view: EditorView, text: string) {
  if (!text) {
    return Decoration.none;
  }

  return Decoration.set([
    Decoration.widget({
      widget: new GhostTextWidget(text),
      side: 1,
    }).range(view.state.selection.main.head),
  ]);
}

function ghostTextExtension(text: string): Extension {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = ghostDecorations(view, text);
      }

      update(update: { view: EditorView; docChanged: boolean; selectionSet: boolean; viewportChanged: boolean }) {
        if (update.docChanged || update.selectionSet || update.viewportChanged) {
          this.decorations = ghostDecorations(update.view, text);
        }
      }
    },
    {
      decorations: (plugin) => plugin.decorations,
    },
  );
}

interface CreateExtensionsOptions {
  fileId: string;
  language: Extension;
  languageLabel: string;
  theme: 'dark' | 'light';
  tabSize: number;
  wordWrap: boolean;
  ghostText: string;
  onAcceptGhost: () => boolean;
  onUpdate: Extension;
  diagnostics: DiagnosticsSettings;
}

function diagnosticsLanguageEnabled(languageLabel: string, enabledLanguages: string[]) {
  const normalizedLabel = languageLabel.toLowerCase().replace(/\s+/g, '');
  return enabledLanguages.some((language) => normalizedLabel.includes(language.toLowerCase()));
}

function diagnosticsExtension(options: CreateExtensionsOptions): Extension {
  return linter(
    async (view) => {
      const shouldLint = options.diagnostics.enabled
        && diagnosticsLanguageEnabled(options.languageLabel, options.diagnostics.enabledLanguages);

      if (!shouldLint) {
        queueMicrotask(() => useEditorStore.getState().setDiagnostics(options.fileId, []));
        return [];
      }

      const code = view.state.doc.toString();
      const diagnostics = await getDiagnosticsForLanguage(code, options.languageLabel);

      if (view.state.doc.toString() !== code) {
        return [];
      }

      queueMicrotask(() => useEditorStore.getState().setDiagnostics(options.fileId, diagnostics));

      return diagnostics.map((diagnostic) => ({
        from: diagnostic.from,
        to: diagnostic.to,
        severity: diagnostic.severity,
        message: diagnostic.message,
        source: diagnostic.source,
        actions: diagnostic.actions?.map((action) => ({
          name: action.name,
          apply: (editorView: EditorView, from: number, to: number) => action.apply(editorView, from, to),
        })),
      }));
    },
    {
      delay: options.diagnostics.delay,
      markerFilter: options.diagnostics.showSquiggles ? null : () => [],
    },
  );
}

export function createEditorExtensions(options: CreateExtensionsOptions): Extension[] {
  const tab = ' '.repeat(options.tabSize);

  return [
    mobileEditorTheme,
    getEditorTheme(options.theme),
    options.language,
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    options.diagnostics.showGutter ? lintGutter() : [],
    diagnosticsExtension(options),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    indentUnit.of(tab),
    EditorState.tabSize.of(options.tabSize),
    options.wordWrap ? EditorView.lineWrapping : [],
    ghostTextExtension(options.ghostText),
    Prec.highest(
      keymap.of([
        {
          key: 'Tab',
          run: options.onAcceptGhost,
        },
      ]),
    ),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...completionKeymap,
      ...lintKeymap,
      indentWithTab,
    ]),
    options.onUpdate,
  ];
}
