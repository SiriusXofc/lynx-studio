import { Bot } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useSettingsStore } from '../../store/settingsStore';
import { SYMBOLS } from './SYMBOLS';
import { useAI } from '../AI/useAI';

function insertText(text: string) {
  const view = useEditorStore.getState().editorView;

  if (!view) {
    return;
  }

  const { from, to } = view.state.selection.main;
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: from + text.length },
  });
  view.focus();
}

function deleteBackward() {
  const view = useEditorStore.getState().editorView;

  if (!view) {
    return;
  }

  const { from, to } = view.state.selection.main;

  if (from !== to) {
    view.dispatch({ changes: { from, to, insert: '' }, selection: { anchor: from } });
    view.focus();
    return;
  }

  if (from > 0) {
    view.dispatch({ changes: { from: from - 1, to: from, insert: '' }, selection: { anchor: from - 1 } });
  }

  view.focus();
}

export function KeyboardRow() {
  const settings = useSettingsStore((state) => state.settings);
  const currentFileId = useEditorStore((state) => state.currentFileId);
  const openFiles = useEditorStore((state) => state.openFiles);
  const aiGhostText = useEditorStore((state) => state.aiGhostText);
  const setAIGhostText = useEditorStore((state) => state.setAIGhostText);
  const { getCompletion } = useAI();
  const symbols = settings.symbols.length ? settings.symbols : SYMBOLS;

  const handleSymbol = (symbol: string) => {
    const view = useEditorStore.getState().editorView;
    const currentFile = openFiles.find((file) => file.id === currentFileId);

    if (symbol === 'DEL') {
      deleteBackward();
      return;
    }

    if (symbol === 'TAB') {
      insertText(' '.repeat(settings.tabSize));
      return;
    }

    if (symbol === '\\n') {
      insertText('\n');
      return;
    }

    if (symbol === 'AI') {
      if (aiGhostText) {
        insertText(aiGhostText);
        setAIGhostText('');
        return;
      }

      if (view && currentFile) {
        const cursor = view.state.selection.main.head;
        void getCompletion(view.state.doc.toString(), cursor, currentFile.language).then(setAIGhostText);
      }
      return;
    }

    insertText(symbol);
  };

  return (
    <div className="keyboard-row flex min-h-12 shrink-0 gap-[3px] overflow-x-auto border-t border-codex-border bg-[#1a1a1a] px-1 py-1.5">
      {symbols.map((symbol) => (
        <button
          key={symbol}
          type="button"
          className="grid h-10 min-w-10 shrink-0 place-items-center rounded-[4px] border border-[#444] bg-[#2d2d2d] px-2 font-mono text-[12px] text-[#cccccc] transition-transform active:scale-95 active:bg-[#444]"
          onClick={() => handleSymbol(symbol)}
          title={symbol === 'AI' ? 'Autocomplete com AI' : `Inserir ${symbol}`}
        >
          {symbol === 'AI' ? <Bot size={13} /> : symbol}
        </button>
      ))}
    </div>
  );
}
