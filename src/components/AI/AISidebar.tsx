import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Send, X } from 'lucide-react';
import type { AIMessage } from '../../types';
import { useEditorStore } from '../../store/editorStore';
import { useAI } from './useAI';

export function AISidebar() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Pergunte sobre o arquivo atual ou peça um trecho de código. Sugestões podem ser inseridas diretamente no editor.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [insertedMessageId, setInsertedMessageId] = useState<string | null>(null);
  const isOpen = useEditorStore((state) => state.isAISidebarOpen);
  const toggleAISidebar = useEditorStore((state) => state.toggleAISidebar);
  const currentFileId = useEditorStore((state) => state.currentFileId);
  const openFiles = useEditorStore((state) => state.openFiles);
  const editorView = useEditorStore((state) => state.editorView);
  const { chatAboutCode } = useAI();
  const currentFile = useMemo(
    () => openFiles.find((file) => file.id === currentFileId),
    [currentFileId, openFiles],
  );

  const send = async () => {
    if (!input.trim() || !currentFile) {
      return;
    }

    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };
    setMessages((state) => [...state, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const answer = await chatAboutCode(currentFile.content, currentFile.language, userMessage.content);
      setMessages((state) => [
        ...state,
        { id: crypto.randomUUID(), role: 'assistant', content: answer },
      ]);
    } catch {
      setMessages((state) => [
        ...state,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Não consegui responder agora. Verifique sua chave da Anthropic e tente novamente.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const insertMessage = (messageId: string, content: string) => {
    if (!editorView) {
      return;
    }

    const { from, to } = editorView.state.selection.main;
    editorView.dispatch({
      changes: { from, to, insert: content },
      selection: { anchor: from + content.length },
    });
    editorView.focus();
    setInsertedMessageId(messageId);
    window.setTimeout(() => setInsertedMessageId(null), 1500);
  };

  return (
    <aside
      className={clsx(
        'absolute inset-y-0 right-0 z-30 flex w-[260px] flex-col border-l border-codex-border bg-codex-panel shadow-2xl transition-[transform,box-shadow] duration-200',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-codex-border px-3">
        <div className="min-w-0">
          <div className="font-sans text-xs text-white">Lynx AI</div>
          <div className="truncate font-sans text-[10px] text-codex-muted">{currentFile?.name ?? 'Nenhum arquivo'}</div>
        </div>
        <button
          type="button"
          aria-label="Fechar AI"
          className="grid h-7 w-7 place-items-center rounded-[4px] text-codex-muted active:bg-codex-hover active:text-white"
          onClick={() => toggleAISidebar(false)}
        >
          <X size={15} />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-auto p-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={clsx(
              'rounded-[6px] border px-2 py-2 font-sans text-xs leading-5',
              message.role === 'user'
                ? 'border-codex-selected bg-codex-selected/50 text-white'
                : 'border-codex-border bg-[#1f1f1f] text-codex-text',
            )}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
            {message.role === 'assistant' && (
              <button
                type="button"
                className="mt-2 h-7 rounded-[4px] bg-codex-accent px-2 text-[11px] text-white active:bg-codex-accentHover"
                onClick={() => insertMessage(message.id, message.content)}
              >
                {insertedMessageId === message.id ? 'Inserido' : 'Inserir no editor'}
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-codex-accent"
                  style={{ animationDelay: `${index * 150}ms` }}
                />
              ))}
            </div>
            <span className="font-sans text-[11px] text-codex-muted">Lynx AI está pensando...</span>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-codex-border p-2">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="h-20 w-full resize-none rounded-[6px] border border-codex-border bg-codex-bg p-2 font-sans text-xs text-codex-text outline-none focus:border-codex-accent"
          placeholder="Pergunte sobre este arquivo"
        />
        <button
          type="button"
          className="mt-2 flex h-8 w-full items-center justify-center gap-2 rounded-[4px] bg-codex-accent font-sans text-xs text-white active:bg-codex-accentHover"
          onClick={send}
        >
          <Send size={13} /> Enviar
        </button>
      </div>
    </aside>
  );
}
