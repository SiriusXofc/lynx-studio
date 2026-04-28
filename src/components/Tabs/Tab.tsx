import clsx from 'clsx';
import { X } from 'lucide-react';
import type { OpenFile } from '../../types';
import { getFileBadge } from '../Editor/languages';

interface TabProps {
  file: OpenFile;
  active: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

export function Tab({ file, active, onSelect, onClose }: TabProps) {
  const badge = getFileBadge(file.path);

  return (
    <button
      type="button"
      className={clsx(
        'group flex h-[42px] max-w-[142px] shrink-0 items-center gap-1 border-b-2 px-2.5 font-sans text-[11px] transition-colors',
        active
          ? 'border-codex-accent bg-codex-bg text-white'
          : 'border-transparent bg-transparent text-codex-muted active:bg-codex-hover active:text-white',
      )}
      onClick={() => onSelect(file.id)}
    >
      <span
        className="grid h-3.5 min-w-4 shrink-0 place-items-center rounded-[2px] px-0.5 text-[7px] font-bold leading-none text-black"
        style={{ backgroundColor: badge.color }}
      >
        {badge.label}
      </span>
      <span className="min-w-0 flex-1 truncate">{file.name}</span>
      {file.dirty ? (
        <span
          role="button"
          tabIndex={0}
          aria-label="Fechar arquivo com mudanças não salvas"
          title="Fechar (há mudanças não salvas)"
          className="grid h-5 w-5 shrink-0 place-items-center rounded-[3px] active:bg-codex-hover"
          onClick={(event) => {
            event.stopPropagation();
            onClose(file.id);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              onClose(file.id);
            }
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
        </span>
      ) : (
        <span
          role="button"
          tabIndex={0}
          aria-label="Fechar arquivo"
          className="grid h-5 w-5 shrink-0 place-items-center rounded-[3px] text-codex-muted opacity-80 active:bg-codex-hover active:text-white"
          onClick={(event) => {
            event.stopPropagation();
            onClose(file.id);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              onClose(file.id);
            }
          }}
        >
          <X size={12} />
        </span>
      )}
    </button>
  );
}
