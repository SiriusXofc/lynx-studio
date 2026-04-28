import { useMemo, useState } from 'react';
import { Check, CircleDot, GitCommitHorizontal, Plus } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useSettingsStore } from '../../store/settingsStore';
import { getFileBadge } from '../Editor/languages';
import { PanelSection } from './PanelSection';

export function SourceControlView() {
  const [message, setMessage] = useState('');
  const openFiles = useEditorStore((state) => state.openFiles);
  const openTab = useEditorStore((state) => state.openTab);
  const markSaved = useEditorStore((state) => state.markSaved);
  const branch = useEditorStore((state) => state.branch);
  const settings = useSettingsStore((state) => state.settings);
  const changes = useMemo(() => openFiles.filter((file) => file.dirty), [openFiles]);

  const commit = () => {
    changes.forEach((file) => markSaved(file.id));
    setMessage('');
  };

  return (
    <div className="h-full overflow-auto p-2 font-sans text-xs text-codex-text">
      <div className="mb-3 rounded-[6px] border border-codex-border bg-[#1f1f1f] p-2">
        <div className="flex items-center gap-2 text-white">
          <CircleDot size={13} className="text-codex-accent" />
          <span className="min-w-0 flex-1 truncate">{branch}</span>
        </div>
        <div className="mt-1 text-[10px] text-codex-muted">
          {settings.gitUsername || 'Autor não configurado'} {'\u00b7'} {changes.length} alterado(s)
        </div>
      </div>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="h-20 w-full resize-none rounded-[4px] border border-codex-border bg-codex-bg p-2 text-xs text-codex-text outline-none focus:border-codex-accent"
        placeholder="Mensagem do commit"
      />
      <button
        type="button"
        className="mt-2 flex h-8 w-full items-center justify-center gap-2 rounded-[4px] bg-codex-accent text-xs text-white active:bg-codex-accentHover disabled:opacity-45"
        onClick={commit}
        disabled={!message.trim() || changes.length === 0}
      >
        <GitCommitHorizontal size={14} /> Commit
      </button>

      <PanelSection title="Alterações" count={changes.length}>
        {changes.length === 0 && (
          <div className="px-3 py-4 text-xs text-codex-muted">Nenhuma alteração detectada</div>
        )}
        {changes.map((file) => {
          const badge = getFileBadge(file.path);
          return (
            <button
              key={file.id}
              type="button"
              className="flex h-9 w-full items-center gap-2 px-2 text-left active:bg-codex-hover"
              onClick={() => openTab(file.path)}
            >
              <span className="grid h-6 w-6 place-items-center rounded-[4px] bg-[#2d2d2d]">
                <Plus size={12} className="text-codex-accent" />
              </span>
              <span
                className="grid h-4 min-w-5 place-items-center rounded-[3px] px-1 text-[8px] font-semibold leading-none text-black"
                style={{ backgroundColor: badge.color }}
              >
                {badge.label}
              </span>
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <Check size={13} className="text-codex-muted" />
            </button>
          );
        })}
      </PanelSection>
    </div>
  );
}
