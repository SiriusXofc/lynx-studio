import { Bot, Circle, GitBranch, SplitSquareHorizontal } from 'lucide-react';
import type { OpenFile } from '../../types';
import { useEditorStore } from '../../store/editorStore';

interface EditorHeaderProps {
  file: OpenFile | null;
}

export function EditorHeader({ file }: EditorHeaderProps) {
  const toggleAISidebar = useEditorStore((state) => state.toggleAISidebar);
  const toggleWorkbenchView = useEditorStore((state) => state.toggleWorkbenchView);
  const branch = useEditorStore((state) => state.branch);

  if (!file) {
    return null;
  }

  const breadcrumbs = file.path.split('/').filter(Boolean).slice(-4);

  return (
    <div className="flex h-8 shrink-0 items-center gap-2 border-b border-codex-border bg-[#1b1b1b] px-2 font-sans text-[11px] text-codex-muted">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-1 active:text-white"
        onClick={() => toggleWorkbenchView('outline')}
      >
        {breadcrumbs.map((part, index) => (
          <span key={`${part}-${index}`} className={index === breadcrumbs.length - 1 ? 'truncate text-codex-text' : 'shrink-0'}>
            {part}{index < breadcrumbs.length - 1 ? ' /' : ''}
          </span>
        ))}
        {file.dirty && <Circle size={8} fill="currentColor" className="shrink-0 text-codex-accent" />}
      </button>

      <span className="hidden items-center gap-1 text-[10px] text-codex-muted min-[380px]:flex">
        <GitBranch size={11} /> {branch}
      </span>
      <button
        type="button"
        aria-label="Dividir editor (em breve)"
        title="Dividir editor (em breve)"
        className="grid h-6 w-6 cursor-not-allowed place-items-center rounded-[4px] text-codex-muted/40"
        disabled
      >
        <SplitSquareHorizontal size={13} />
      </button>
      <button
        type="button"
        aria-label="Perguntar para Lynx AI"
        title="Perguntar para Lynx AI"
        className="grid h-6 w-6 place-items-center rounded-[4px] text-codex-muted active:bg-codex-hover active:text-white"
        onClick={() => toggleAISidebar(true)}
      >
        <Bot size={13} />
      </button>
    </div>
  );
}
