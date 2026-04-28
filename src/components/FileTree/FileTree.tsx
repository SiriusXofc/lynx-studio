import clsx from 'clsx';
import { FilePlus, FolderOpen, Pencil, Trash2 } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useFileStore } from '../../store/fileStore';
import { FileTreeItem } from './FileTreeItem';
import { useFileTree } from './useFileTree';

export function FileTree() {
  const tree = useFileStore((state) => state.tree);
  const expandedPaths = useFileStore((state) => state.expandedPaths);
  const toggleFolder = useFileStore((state) => state.toggleFolder);
  const openTab = useEditorStore((state) => state.openTab);
  const currentFileId = useEditorStore((state) => state.currentFileId);
  const isOpen = useEditorStore((state) => state.isFileTreeOpen);
  const toggleFileTree = useEditorStore((state) => state.toggleFileTree);
  const createUntitled = useEditorStore((state) => state.createUntitled);
  const { contextMenu, setContextMenu, startLongPress, cancelLongPress } = useFileTree();

  return (
    <>
      <div
        className={clsx(
          'absolute inset-y-0 z-20 flex w-[200px] flex-col border-r border-codex-border bg-codex-panel shadow-drawer transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="flex h-9 shrink-0 items-center justify-between border-b border-codex-border px-3">
          <span className="font-sans text-[10px] uppercase tracking-[1px] text-codex-text">Explorador</span>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-[4px] text-codex-muted active:bg-codex-hover active:text-white"
            aria-label="Novo arquivo"
            onClick={createUntitled}
          >
            <FilePlus size={14} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto py-1">
          {tree.map((node) => (
            <FileTreeItem
              key={node.id}
              node={node}
              depth={0}
              activePath={currentFileId}
              expandedPaths={expandedPaths}
              onToggleFolder={toggleFolder}
              onOpenFile={openTab}
              onLongPressStart={startLongPress}
              onLongPressEnd={cancelLongPress}
            />
          ))}
        </div>
      </div>

      {isOpen && (
        <button
          type="button"
          aria-label="Fechar árvore de arquivos"
          className="absolute inset-0 z-10 bg-black/30"
          onClick={() => toggleFileTree(false)}
        />
      )}

      {contextMenu && (
        <div
          className="absolute z-30 w-40 overflow-hidden rounded-[6px] border border-codex-border bg-codex-panel py-1 text-xs text-codex-text shadow-xl"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 168),
            top: Math.min(contextMenu.y, window.innerHeight - 132),
          }}
        >
          <button type="button" className="flex h-8 w-full items-center gap-2 px-3 active:bg-codex-hover">
            <Pencil size={13} /> Renomear
          </button>
          <button type="button" className="flex h-8 w-full items-center gap-2 px-3 active:bg-codex-hover">
            <FolderOpen size={13} /> Novo arquivo aqui
          </button>
          <button type="button" className="flex h-8 w-full items-center gap-2 px-3 text-red-300 active:bg-codex-hover">
            <Trash2 size={13} /> Excluir
          </button>
          <button
            type="button"
            className="h-7 w-full border-t border-codex-border px-3 text-left text-codex-muted active:bg-codex-hover"
            onClick={() => setContextMenu(null)}
          >
            Fechar
          </button>
        </div>
      )}
    </>
  );
}
