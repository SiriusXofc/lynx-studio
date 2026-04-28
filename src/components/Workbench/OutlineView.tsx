import { useMemo } from 'react';
import { Braces, Box, Code2, FileInput, Layers, SquareFunction } from 'lucide-react';
import { EditorView } from '@codemirror/view';
import type { OutlineSymbol } from '../../types';
import { useEditorStore } from '../../store/editorStore';
import { PanelSection } from './PanelSection';

function symbolIcon(kind: OutlineSymbol['kind']) {
  if (kind === 'function') return SquareFunction;
  if (kind === 'class') return Box;
  if (kind === 'interface') return Layers;
  if (kind === 'import') return FileInput;
  if (kind === 'selector') return Braces;
  return Code2;
}

function parseOutline(content: string): OutlineSymbol[] {
  return content.split('\n').flatMap((line, index) => {
    const trimmed = line.trim();
    const lineNumber = index + 1;
    const symbols: OutlineSymbol[] = [];

    const importMatch = trimmed.match(/^import\s+(.*?)(?:\s+from\s+['"].*['"])?;?$/);
    const interfaceMatch = trimmed.match(/^interface\s+([A-Za-z0-9_]+)/);
    const classMatch = trimmed.match(/^class\s+([A-Za-z0-9_]+)/);
    const functionMatch = trimmed.match(/^(?:export\s+default\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)/);
    const constFunctionMatch = trimmed.match(/^(?:export\s+)?const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\(/);
    const cssSelectorMatch = trimmed.match(/^([.#][A-Za-z0-9_-]+)\s*\{/);

    if (importMatch) {
      symbols.push({ id: `import-${lineNumber}`, name: importMatch[1].slice(0, 34), kind: 'import', line: lineNumber });
    }
    if (interfaceMatch) {
      symbols.push({ id: `interface-${lineNumber}`, name: interfaceMatch[1], kind: 'interface', line: lineNumber });
    }
    if (classMatch) {
      symbols.push({ id: `class-${lineNumber}`, name: classMatch[1], kind: 'class', line: lineNumber });
    }
    if (functionMatch) {
      symbols.push({ id: `function-${lineNumber}`, name: functionMatch[1], kind: 'function', line: lineNumber });
    }
    if (constFunctionMatch) {
      symbols.push({ id: `const-${lineNumber}`, name: constFunctionMatch[1], kind: 'constant', line: lineNumber });
    }
    if (cssSelectorMatch) {
      symbols.push({ id: `selector-${lineNumber}`, name: cssSelectorMatch[1], kind: 'selector', line: lineNumber });
    }

    return symbols;
  });
}

export function OutlineView() {
  const currentFileId = useEditorStore((state) => state.currentFileId);
  const openFiles = useEditorStore((state) => state.openFiles);
  const editorView = useEditorStore((state) => state.editorView);
  const currentFile = useMemo(
    () => openFiles.find((file) => file.id === currentFileId),
    [currentFileId, openFiles],
  );
  const symbols = useMemo(() => parseOutline(currentFile?.content ?? ''), [currentFile?.content]);

  const reveal = (lineNumber: number) => {
    const view = useEditorStore.getState().editorView ?? editorView;

    if (!view) {
      return;
    }

    const line = view.state.doc.line(Math.min(lineNumber, view.state.doc.lines));
    view.dispatch({
      selection: { anchor: line.from },
      effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
    });
    view.focus();
  };

  return (
    <div className="h-full overflow-auto">
      <PanelSection title={currentFile?.name ?? 'Estrutura'} count={symbols.length}>
        {symbols.length === 0 && <div className="px-3 py-4 font-sans text-xs text-codex-muted">Nenhum símbolo encontrado</div>}
        {symbols.map((symbol) => {
          const Icon = symbolIcon(symbol.kind);
          return (
            <button
              key={symbol.id}
              type="button"
              className="flex h-8 w-full items-center gap-2 px-3 text-left font-sans text-[12px] text-codex-text active:bg-codex-hover"
              onClick={() => reveal(symbol.line)}
            >
              <Icon size={13} className="text-codex-muted" />
              <span className="min-w-0 flex-1 truncate">{symbol.name}</span>
              <span className="text-[10px] text-codex-muted">{symbol.line}</span>
            </button>
          );
        })}
      </PanelSection>
    </div>
  );
}
