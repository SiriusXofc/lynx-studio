import clsx from 'clsx';
import { X } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { ExplorerView } from './ExplorerView';
import { OutlineView } from './OutlineView';
import { SearchView } from './SearchView';
import { SourceControlView } from './SourceControlView';

const titles = {
  explorer: 'Explorador',
  search: 'Buscar',
  'source-control': 'Controle de Versão',
  outline: 'Estrutura',
};

export function SidePanel() {
  const activeView = useEditorStore((state) => state.activeView);
  const isOpen = useEditorStore((state) => state.isFileTreeOpen);
  const toggleFileTree = useEditorStore((state) => state.toggleFileTree);

  return (
    <>
      <aside
        className={clsx(
          'absolute inset-y-0 left-11 z-50 flex w-[248px] max-w-[calc(100%-44px)] flex-col border-r border-codex-border bg-codex-panel shadow-drawer transition-[transform,box-shadow] duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-[248px]',
        )}
      >
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-codex-border px-3">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[1px] text-codex-text">
            {titles[activeView]}
          </span>
          <button
            type="button"
            aria-label="Fechar painel"
            className="grid h-7 w-7 place-items-center rounded-[4px] text-codex-muted active:bg-codex-hover active:text-white"
            onClick={() => toggleFileTree(false)}
          >
            <X size={14} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {activeView === 'explorer' && <ExplorerView />}
          {activeView === 'search' && <SearchView />}
          {activeView === 'source-control' && <SourceControlView />}
          {activeView === 'outline' && <OutlineView />}
        </div>
      </aside>

      {isOpen && (
        <button
          type="button"
          aria-label="Fechar overlay do painel"
          className="absolute inset-y-0 left-[292px] right-0 z-40 bg-black/25 transition-opacity duration-200"
          onClick={() => toggleFileTree(false)}
        />
      )}
    </>
  );
}
