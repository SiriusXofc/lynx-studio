import clsx from 'clsx';
import {
  Bot,
  Files,
  GitBranch,
  Search,
  Settings,
  SquareFunction,
  TerminalSquare,
  type LucideIcon,
} from 'lucide-react';
import type { WorkbenchView } from '../../types';
import { useEditorStore } from '../../store/editorStore';
import { usePlatform } from '../../hooks/usePlatform';

const primaryViews: Array<{ id: WorkbenchView; label: string; icon: LucideIcon }> = [
  { id: 'explorer', label: 'Explorador', icon: Files },
  { id: 'search', label: 'Buscar', icon: Search },
  { id: 'source-control', label: 'Controle de Versão', icon: GitBranch },
  { id: 'outline', label: 'Estrutura', icon: SquareFunction },
];

export function ActivityBar() {
  const activeView = useEditorStore((state) => state.activeView);
  const isPanelOpen = useEditorStore((state) => state.isFileTreeOpen);
  const openFiles = useEditorStore((state) => state.openFiles);
  const toggleWorkbenchView = useEditorStore((state) => state.toggleWorkbenchView);
  const toggleAISidebar = useEditorStore((state) => state.toggleAISidebar);
  const toggleSettings = useEditorStore((state) => state.toggleSettings);
  const toggleTerminal = useEditorStore((state) => state.toggleTerminal);
  const dirtyCount = openFiles.filter((file) => file.dirty).length;
  const { isMobile } = usePlatform();

  return (
    <nav className="absolute inset-y-0 left-0 z-[60] flex w-[var(--activity-bar-width)] flex-col items-center border-r border-codex-border bg-[#181818] py-1">
      <div className="flex flex-1 flex-col items-center gap-1">
        {primaryViews.map((view) => {
          const Icon = view.icon;
          const active = activeView === view.id && isPanelOpen;

          return (
            <button
              key={view.id}
              type="button"
              aria-label={view.label}
              title={view.label}
              className={clsx(
                'activity-button relative grid h-10 w-10 place-items-center rounded-[4px] text-codex-muted transition-colors active:bg-codex-hover',
                active && 'text-white',
              )}
              onClick={() => toggleWorkbenchView(view.id)}
            >
              {active && <span className="absolute left-0 h-6 w-[2px] rounded-r bg-codex-accent" />}
              <Icon size={19} />
              {view.id === 'source-control' && dirtyCount > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-codex-accent px-1 font-sans text-[9px] text-white">
                  {dirtyCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          aria-label="Lynx AI"
          title="Lynx AI"
          className="activity-button grid h-10 w-10 place-items-center rounded-[4px] text-codex-muted active:bg-codex-hover active:text-white"
          onClick={() => toggleAISidebar()}
        >
          <Bot size={18} />
        </button>
        <button
          type="button"
          aria-label="Terminal"
          title={isMobile ? 'Terminal indisponível no Android' : 'Terminal'}
          className="activity-button grid h-10 w-10 place-items-center rounded-[4px] text-codex-muted active:bg-codex-hover active:text-white disabled:cursor-not-allowed disabled:opacity-35"
          onClick={() => {
            if (!isMobile) {
              toggleTerminal();
            }
          }}
          disabled={isMobile}
        >
          <TerminalSquare size={18} />
        </button>
        <button
          type="button"
          aria-label="Configurações"
          title="Configurações"
          className="activity-button grid h-10 w-10 place-items-center rounded-[4px] text-codex-muted active:bg-codex-hover active:text-white"
          onClick={() => toggleSettings(true)}
        >
          <Settings size={18} />
        </button>
      </div>
    </nav>
  );
}
