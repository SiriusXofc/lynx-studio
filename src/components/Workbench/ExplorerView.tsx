import { useState } from 'react';
import { FilePlus, SaveAll, X } from 'lucide-react';
import type { FileNode } from '../../types';
import { useEditorStore } from '../../store/editorStore';
import { useFileStore } from '../../store/fileStore';
import { useFileSystem } from '../../hooks/useFileSystem';
import { FileTreeItem } from '../FileTree/FileTreeItem';
import { useFileTree } from '../FileTree/useFileTree';
import { PanelSection } from './PanelSection';

export function ExplorerView() {
  const tree = useFileStore((state) => state.tree);
  const expandedPaths = useFileStore((state) => state.expandedPaths);
  const setTree = useFileStore((state) => state.setTree);
  const toggleFolder = useFileStore((state) => state.toggleFolder);
  const openFiles = useEditorStore((state) => state.openFiles);
  const currentFileId = useEditorStore((state) => state.currentFileId);
  const openTab = useEditorStore((state) => state.openTab);
  const switchTab = useEditorStore((state) => state.switchTab);
  const closeTab = useEditorStore((state) => state.closeTab);
  const createUntitled = useEditorStore((state) => state.createUntitled);
  const markSaved = useEditorStore((state) => state.markSaved);
  const { openFolderPicker, readFile, saveFile } = useFileSystem();
  const { contextMenu, setContextMenu, startLongPress, cancelLongPress } = useFileTree();
  const dirtyCount = openFiles.filter((file) => file.dirty).length;
  const [error, setError] = useState('');

  const saveAll = () => {
    setError('');
    openFiles.forEach((file) => {
      const isVirtualFile = file.path.startsWith('/workspace/') || file.path.startsWith('/untitled-');

      if (isVirtualFile) {
        markSaved(file.id);
        return;
      }

      void saveFile(file.path, file.content)
        .then(() => markSaved(file.id, file.content))
        .catch(() => setError(`Não foi possível salvar ${file.name}. Verifique a permissão da pasta.`));
    });
  };

  const openProjectFolder = () => {
    setError('');
    void openFolderPicker()
      .then((result) => {
        if (!result) {
          return;
        }

        setTree(result.tree, result.root);
      })
      .catch(() => setError('Não foi possível abrir a pasta. No Android, escolha uma pasta permitida pelo sistema.'));
  };

  const openFile = (path: string) => {
    setError('');
    void readFile(path)
      .then((content) => openTab(path, content))
      .catch(() => {
        if (path.startsWith('/workspace/')) {
          openTab(path);
          return;
        }

        setError('Não foi possível ler este arquivo. Verifique as permissões de acesso.');
      });
  };

  return (
    <div className="relative h-full overflow-auto">
      <PanelSection title="Editores Abertos" count={openFiles.length}>
        <div className="space-y-0.5 px-1">
          {openFiles.map((file) => (
            <button
              key={file.id}
              type="button"
              className={`flex h-7 w-full items-center gap-2 rounded-[3px] px-2 font-sans text-[12px] ${
                file.id === currentFileId ? 'bg-codex-selected text-white' : 'text-codex-text active:bg-codex-hover'
              }`}
              onClick={() => switchTab(file.id)}
            >
              <span className="min-w-0 flex-1 truncate text-left">{file.name}</span>
              {file.dirty && <span className="h-1.5 w-1.5 rounded-full bg-codex-accent" />}
              <span
                role="button"
                tabIndex={0}
                className="grid h-5 w-5 place-items-center rounded-[3px] text-codex-muted active:bg-codex-hover active:text-white"
                onClick={(event) => {
                  event.stopPropagation();
                  closeTab(file.id);
                }}
              >
                <X size={12} />
              </span>
            </button>
          ))}
        </div>
        <div className="mt-1 flex gap-1 px-2">
          <button
            type="button"
            className="flex h-7 flex-1 items-center justify-center gap-1 rounded-[4px] border border-codex-border font-sans text-[11px] text-codex-text active:bg-codex-hover"
            onClick={createUntitled}
          >
            <FilePlus size={13} /> Novo
          </button>
          <button
            type="button"
            className="flex h-7 flex-1 items-center justify-center gap-1 rounded-[4px] border border-codex-border font-sans text-[11px] text-codex-text active:bg-codex-hover disabled:opacity-40"
            onClick={saveAll}
            disabled={dirtyCount === 0}
          >
            <SaveAll size={13} /> Salvar tudo
          </button>
        </div>
      </PanelSection>

      <PanelSection title="Lynx Mobile" count={tree.length}>
        <div className="px-2 pb-2">
          <button
            type="button"
            className="flex h-8 w-full items-center justify-center gap-1 rounded-[4px] border border-codex-border font-sans text-[11px] text-codex-text active:bg-codex-hover"
            onClick={openProjectFolder}
          >
            Abrir pasta...
          </button>
          {error && (
            <div className="mt-2 rounded-[4px] border border-red-500/30 bg-red-500/10 px-2 py-1.5 font-sans text-[10px] leading-snug text-red-200">
              {error}
            </div>
          )}
        </div>
        {tree.map((node: FileNode) => (
          <FileTreeItem
            key={node.id}
            node={node}
            depth={0}
            activePath={currentFileId}
            expandedPaths={expandedPaths}
            onToggleFolder={toggleFolder}
            onOpenFile={openFile}
            onLongPressStart={startLongPress}
            onLongPressEnd={cancelLongPress}
          />
        ))}
      </PanelSection>

      {contextMenu && (
        <div
          className="absolute z-40 w-40 overflow-hidden rounded-[6px] border border-codex-border bg-codex-panel py-1 text-xs text-codex-text shadow-xl"
          style={{ left: Math.min(contextMenu.x, 84), top: Math.max(8, contextMenu.y - 88) }}
        >
          <button type="button" className="h-8 w-full px-3 text-left active:bg-codex-hover">Renomear</button>
          <button type="button" className="h-8 w-full px-3 text-left active:bg-codex-hover">Novo arquivo</button>
          <button type="button" className="h-8 w-full px-3 text-left text-red-300 active:bg-codex-hover">Excluir</button>
          <button
            type="button"
            className="h-7 w-full border-t border-codex-border px-3 text-left text-codex-muted active:bg-codex-hover"
            onClick={() => setContextMenu(null)}
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}
