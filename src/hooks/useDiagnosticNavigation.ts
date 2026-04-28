import { useEditorStore } from '../store/editorStore';
import type { LynxDiagnostic } from '../diagnostics/types';

export function useDiagnosticNavigation(diagnostics: LynxDiagnostic[]) {
  const editorView = useEditorStore((state) => state.editorView);

  const goToNextError = () => {
    if (!editorView) {
      return;
    }

    const targets = diagnostics
      .filter((diagnostic) => diagnostic.severity === 'error' || diagnostic.severity === 'warning')
      .sort((a, b) => a.from - b.from);

    if (targets.length === 0) {
      return;
    }

    const cursor = editorView.state.selection.main.head;
    const target = targets.find((diagnostic) => diagnostic.from > cursor) ?? targets[0];

    editorView.dispatch({
      selection: { anchor: target.from },
      scrollIntoView: true,
    });
    editorView.focus();
  };

  const goToPrevError = () => {
    if (!editorView) {
      return;
    }

    const targets = diagnostics
      .filter((diagnostic) => diagnostic.severity === 'error' || diagnostic.severity === 'warning')
      .sort((a, b) => a.from - b.from);

    if (targets.length === 0) {
      return;
    }

    const cursor = editorView.state.selection.main.head;
    const target = [...targets].reverse().find((diagnostic) => diagnostic.from < cursor)
      ?? targets[targets.length - 1];

    editorView.dispatch({
      selection: { anchor: target.from },
      scrollIntoView: true,
    });
    editorView.focus();
  };

  return { goToNextError, goToPrevError };
}
