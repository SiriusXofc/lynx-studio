import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface PanelSectionProps {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function PanelSection({ title, count, children, defaultOpen = true }: PanelSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <section className="border-b border-codex-border">
      <button
        type="button"
        className="flex h-8 w-full items-center gap-1 px-2 font-sans text-[10px] font-semibold uppercase tracking-[0.7px] text-codex-muted active:bg-codex-hover"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <span className="min-w-0 flex-1 truncate text-left">{title}</span>
        {typeof count === 'number' && <span className="text-[10px] text-codex-muted">{count}</span>}
      </button>
      {open && <div className="pb-1">{children}</div>}
    </section>
  );
}
