import { useMemo, useState } from 'react';
import { EditorView } from '@codemirror/view';
import { CaseSensitive, Regex, WholeWord } from 'lucide-react';
import type { SearchMatch } from '../../types';
import { sampleFiles } from '../../data/sampleProject';
import { useEditorStore } from '../../store/editorStore';
import { getFileBadge } from '../Editor/languages';
import { PanelSection } from './PanelSection';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSearchRegex(query: string, regex: boolean, caseSensitive: boolean, wholeWord: boolean) {
  if (!query.trim()) {
    return null;
  }

  const source = regex ? query : escapeRegExp(query);
  return new RegExp(wholeWord ? `\\b${source}\\b` : source, caseSensitive ? 'g' : 'gi');
}

export function SearchView() {
  const [query, setQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [regex, setRegex] = useState(false);
  const openFiles = useEditorStore((state) => state.openFiles);
  const openTab = useEditorStore((state) => state.openTab);
  const editorView = useEditorStore((state) => state.editorView);
  const files = useMemo(() => {
    const map = new Map(Object.entries(sampleFiles));
    openFiles.forEach((file) => map.set(file.path, file.content));
    return Array.from(map.entries());
  }, [openFiles]);

  const matches = useMemo<SearchMatch[]>(() => {
    const matcher = buildSearchRegex(query, regex, caseSensitive, wholeWord);

    if (!matcher) {
      return [];
    }

    return files.flatMap(([path, content]) => {
      const name = path.split('/').pop() ?? path;
      return content.split('\n').flatMap((line, index) => {
        matcher.lastIndex = 0;
        const lineMatches = Array.from(line.matchAll(matcher));
        return lineMatches.slice(0, 4).map((match, matchIndex) => ({
          id: `${path}:${index}:${match.index ?? 0}:${matchIndex}`,
          path,
          name,
          line: index + 1,
          column: (match.index ?? 0) + 1,
          preview: line.trim() || line,
        }));
      });
    }).slice(0, 80);
  }, [caseSensitive, files, query, regex, wholeWord]);

  const openMatch = (match: SearchMatch) => {
    openTab(match.path);
    window.setTimeout(() => {
      const view = useEditorStore.getState().editorView ?? editorView;
      if (!view) {
        return;
      }

      const line = view.state.doc.line(Math.min(match.line, view.state.doc.lines));
      const anchor = Math.min(line.to, line.from + Math.max(0, match.column - 1));
      view.dispatch({
        selection: { anchor },
        effects: EditorView.scrollIntoView(anchor, { y: 'center' }),
      });
      view.focus();
    }, 60);
  };

  return (
    <div className="h-full overflow-auto p-2">
      <div className="space-y-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-8 w-full rounded-[4px] border border-codex-border bg-codex-bg px-2 font-sans text-xs text-codex-text outline-none focus:border-codex-accent"
          placeholder="Buscar nos arquivos"
        />
        <div className="flex gap-1">
          {[
            { active: caseSensitive, set: setCaseSensitive, label: 'Diferenciar maiúsculas', icon: CaseSensitive },
            { active: wholeWord, set: setWholeWord, label: 'Palavra inteira', icon: WholeWord },
            { active: regex, set: setRegex, label: 'Usar expressão regular', icon: Regex },
          ].map((toggle) => {
            const Icon = toggle.icon;
            return (
              <button
                key={toggle.label}
                type="button"
                title={toggle.label}
                aria-label={toggle.label}
                className={`grid h-7 w-8 place-items-center rounded-[4px] border border-codex-border ${
                  toggle.active ? 'bg-codex-selected text-white' : 'text-codex-muted active:bg-codex-hover'
                }`}
                onClick={() => toggle.set((value) => !value)}
              >
                <Icon size={14} />
              </button>
            );
          })}
        </div>
      </div>

      <PanelSection title="Resultados" count={matches.length}>
        <div className="space-y-1 px-1">
          {matches.length === 0 && (
            <div className="px-2 py-4 font-sans text-xs text-codex-muted">Nenhum resultado</div>
          )}
          {matches.map((match) => {
            const badge = getFileBadge(match.path);
            return (
              <button
                key={match.id}
                type="button"
                className="w-full rounded-[4px] px-2 py-1.5 text-left font-sans active:bg-codex-hover"
                onClick={() => openMatch(match)}
              >
                <div className="flex items-center gap-2 text-[12px] text-codex-text">
                  <span
                    className="grid h-4 min-w-5 place-items-center rounded-[3px] px-1 text-[8px] font-semibold leading-none text-black"
                    style={{ backgroundColor: badge.color }}
                  >
                    {badge.label}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{match.name}</span>
                  <span className="text-[10px] text-codex-muted">{match.line}:{match.column}</span>
                </div>
                <div className="mt-0.5 truncate pl-7 font-mono text-[10px] text-codex-muted">
                  {match.preview}
                </div>
              </button>
            );
          })}
        </div>
      </PanelSection>
    </div>
  );
}
