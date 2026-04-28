import { useMemo, useState } from 'react';
import { EditorView } from '@codemirror/view';
import { Search } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useFileStore } from '../../store/fileStore';
import type { CommandAction, FileNode } from '../../types';

function fuzzyMatch(text: string, query: string) {
  const target = text.toLowerCase();
  const needle = query.toLowerCase();
  let position = 0;

  for (const char of needle) {
    position = target.indexOf(char, position);

    if (position === -1) {
      return false;
    }

    position += 1;
  }

  return true;
}

function flattenNodes(nodes: FileNode[]): FileNode[] {
  return nodes.flatMap((node) => {
    if (node.type === 'file') {
      return [node];
    }

    return flattenNodes(node.children ?? []);
  });
}

export function CommandPalette() {
  const [query, setQuery] = useState('');
  const isOpen = useEditorStore((state) => state.isCommandPaletteOpen);
  const toggleCommandPalette = useEditorStore((state) => state.toggleCommandPalette);
  const toggleAISidebar = useEditorStore((state) => state.toggleAISidebar);
  const toggleSettings = useEditorStore((state) => state.toggleSettings);
  const toggleTerminal = useEditorStore((state) => state.toggleTerminal);
  const openTab = useEditorStore((state) => state.openTab);
  const editorView = useEditorStore((state) => state.editorView);
  const tree = useFileStore((state) => state.tree);
  const files = useMemo(() => flattenNodes(tree), [tree]);

  const commands = useMemo<CommandAction[]>(() => [
    {
      id: 'format',
      label: 'Formatar Documento',
      detail: 'Executa o formatador configurado',
      run: () => toggleCommandPalette(false),
    },
    {
      id: 'ai',
      label: 'Abrir Assistente AI',
      detail: 'Conversar com Claude sobre o arquivo atual',
      run: () => {
        toggleAISidebar(true);
        toggleCommandPalette(false);
      },
    },
    {
      id: 'terminal',
      label: 'Abrir/Fechar Terminal',
      detail: 'Abre o painel de terminal integrado',
      run: () => {
        toggleTerminal();
        toggleCommandPalette(false);
      },
    },
    {
      id: 'settings',
      label: 'Abrir Configurações',
      detail: 'Preferências do editor, AI, teclado e Git',
      run: () => {
        toggleSettings(true);
        toggleCommandPalette(false);
      },
    },
  ], [toggleAISidebar, toggleCommandPalette, toggleSettings, toggleTerminal]);

  const visibleFiles = useMemo(() => {
    if (query.startsWith('>') || query.startsWith(':') || query.startsWith('@')) {
      return [];
    }

    return files
      .filter((file: FileNode) => fuzzyMatch(file.name, query) || fuzzyMatch(file.path, query))
      .slice(0, 8);
  }, [files, query]);

  const visibleCommands = useMemo(() => {
    if (!query.startsWith('>')) {
      return [];
    }

    const commandQuery = query.slice(1).trim();
    return commands.filter((command) => fuzzyMatch(command.label, commandQuery)).slice(0, 8);
  }, [commands, query]);

  const goToLine = () => {
    const lineNumber = Number(query.slice(1));

    if (!editorView || !Number.isFinite(lineNumber)) {
      return;
    }

    const line = editorView.state.doc.line(Math.max(1, Math.min(lineNumber, editorView.state.doc.lines)));
    editorView.dispatch({
      selection: { anchor: line.from },
      effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
    });
    editorView.focus();
    toggleCommandPalette(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-40 bg-black/40 px-3 pt-14" onClick={() => toggleCommandPalette(false)}>
      <div
        className="overflow-hidden rounded-[8px] border border-codex-border bg-codex-panel shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <label className="flex h-11 items-center gap-2 border-b border-codex-border px-3 text-codex-muted">
          <Search size={15} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                toggleCommandPalette(false);
              }

              if (event.key === 'Enter' && query.startsWith(':')) {
                goToLine();
              }
            }}
            className="h-full min-w-0 flex-1 bg-transparent font-sans text-[13px] text-codex-text outline-none"
            placeholder="Digite um comando ou nome de arquivo..."
          />
        </label>

        <div className="max-h-72 overflow-auto py-1">
          {query.startsWith(':') && (
            <button
              type="button"
              className="flex h-9 w-full items-center justify-between px-3 text-left font-sans text-xs text-codex-text active:bg-codex-selected"
              onClick={goToLine}
            >
              <span>Ir para linha {query.slice(1) || '...'}</span>
              <span className="text-codex-muted">Enter</span>
            </button>
          )}

          {visibleCommands.map((command) => (
            <button
              key={command.id}
              type="button"
              className="flex h-11 w-full flex-col justify-center px-3 text-left font-sans active:bg-codex-selected"
              onClick={command.run}
            >
              <span className="text-xs text-codex-text">{command.label}</span>
              <span className="text-[10px] text-codex-muted">{command.detail}</span>
            </button>
          ))}

          {visibleFiles.map((file) => (
            <button
              key={file.id}
              type="button"
              className="flex h-10 w-full flex-col justify-center px-3 text-left font-sans active:bg-codex-selected"
              onClick={() => {
                openTab(file.path);
                toggleCommandPalette(false);
              }}
            >
              <span className="text-xs text-codex-text">{file.name}</span>
              <span className="truncate text-[10px] text-codex-muted">{file.path}</span>
            </button>
          ))}

          {!visibleFiles.length && !visibleCommands.length && !query.startsWith(':') && (
            <div className="px-3 py-4 font-sans text-xs text-codex-muted">Nenhum resultado</div>
          )}
        </div>
      </div>
    </div>
  );
}
