import { FileCode, FolderOpen } from 'lucide-react';

export function EditorEmptyState() {
  return (
    <div className="flex h-full select-none flex-col items-center justify-center gap-4 bg-codex-bg">
      <div className="flex flex-col items-center gap-2 text-codex-muted">
        <FileCode size={40} strokeWidth={1} className="opacity-30" />
        <p className="font-sans text-[13px] text-codex-muted/60">Nenhum arquivo aberto</p>
      </div>
      <div className="flex flex-col items-center gap-1.5 font-sans text-[11px] text-codex-muted/40">
        <span className="flex items-center gap-1.5">
          <FolderOpen size={12} /> Abra um arquivo pelo Explorador
        </span>
        <span>
          ou pressione{' '}
          <kbd className="rounded bg-codex-hover px-1.5 py-0.5 font-mono text-[10px]">+</kbd>
          {' '}para criar um novo
        </span>
      </div>
    </div>
  );
}
