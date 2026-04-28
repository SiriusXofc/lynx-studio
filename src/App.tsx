import { useCallback, useEffect, useMemo } from 'react';
import { Bot, Menu, Plus, Search } from 'lucide-react';
import { AISidebar } from './components/AI/AISidebar';
import { CodeEditor } from './components/Editor/CodeEditor';
import { EditorHeader } from './components/Editor/EditorHeader';
import { KeyboardRow } from './components/KeyboardRow/KeyboardRow';
import { CommandPalette } from './components/CommandPalette/CommandPalette';
import { ProblemsPanel } from './components/Problems/ProblemsPanel';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { StatusBar, TopStatusBar } from './components/StatusBar/StatusBar';
import { TabBar } from './components/Tabs/TabBar';
import { MiniTerminal } from './components/Terminal/MiniTerminal';
import { ActivityBar } from './components/Workbench/ActivityBar';
import { SidePanel } from './components/Workbench/SidePanel';
import { useEditorStore } from './store/editorStore';
import { useSettingsStore } from './store/settingsStore';
import { useGestures } from './hooks/useGestures';
import { useGit } from './hooks/useGit';
import { useDiagnosticNavigation } from './hooks/useDiagnosticNavigation';
import { useKeyboardHeight } from './hooks/useKeyboard';
import { usePlatform } from './hooks/usePlatform';

function App() {
  useKeyboardHeight();
  const { isMobile } = usePlatform();
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const openFiles = useEditorStore((state) => state.openFiles);
  const currentFileId = useEditorStore((state) => state.currentFileId);
  const toggleFileTree = useEditorStore((state) => state.toggleFileTree);
  const toggleWorkbenchView = useEditorStore((state) => state.toggleWorkbenchView);
  const toggleCommandPalette = useEditorStore((state) => state.toggleCommandPalette);
  const toggleAISidebar = useEditorStore((state) => state.toggleAISidebar);
  const toggleProblemsPanel = useEditorStore((state) => state.toggleProblemsPanel);
  const createUntitled = useEditorStore((state) => state.createUntitled);
  const setBranch = useEditorStore((state) => state.setBranch);
  const diagnosticsByFileId = useEditorStore((state) => state.diagnosticsByFileId);
  const editorView = useEditorStore((state) => state.editorView);
  const isProblemsPanelOpen = useEditorStore((state) => state.isProblemsPanelOpen);
  const currentFile = useMemo(
    () => openFiles.find((file) => file.id === currentFileId) ?? null,
    [currentFileId, openFiles],
  );
  const currentDiagnostics = useMemo(
    () => {
      const diagnostics = currentFileId ? diagnosticsByFileId[currentFileId] : [];
      return Array.isArray(diagnostics) ? diagnostics : [];
    },
    [currentFileId, diagnosticsByFileId],
  );
  const { goToNextError, goToPrevError } = useDiagnosticNavigation(currentDiagnostics);
  const { getCurrentBranch } = useGit();
  const gestureHandlers = useGestures({
    onOpenFileTree: () => toggleWorkbenchView('explorer'),
    onCloseFileTree: () => toggleFileTree(false),
    onOpenCommandPalette: () => toggleCommandPalette(true),
  });

  useEffect(() => {
    void hydrateSettings();
  }, [hydrateSettings]);

  useEffect(() => {
    void getCurrentBranch('/workspace').then(setBranch);
  }, [getCurrentBranch, setBranch]);

  const goToDiagnostic = useCallback((from: number) => {
    if (!editorView) {
      return;
    }

    editorView.dispatch({
      selection: { anchor: from },
      scrollIntoView: true,
    });
    editorView.focus();
  }, [editorView]);

  return (
    <div className="app-viewport">
      <div className="app-container flex flex-col overflow-hidden bg-codex-bg text-codex-text" data-mobile={isMobile}>
        <TopStatusBar />

        <header className="flex h-[42px] shrink-0 items-center gap-1 border-b border-codex-border bg-codex-panel px-2">
          <button
            type="button"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[4px] text-codex-muted active:bg-codex-hover active:text-white"
            aria-label="Abrir explorador"
            onClick={() => toggleWorkbenchView('explorer')}
          >
            <Menu size={16} />
          </button>

          <TabBar />

          <button
            type="button"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[4px] text-codex-muted active:bg-codex-hover active:text-white"
            aria-label="Novo arquivo"
            onClick={createUntitled}
          >
            <Plus size={17} />
          </button>
          <button
            type="button"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[4px] text-codex-muted active:bg-codex-hover active:text-white"
            aria-label="Abrir paleta de comandos"
            onClick={() => toggleCommandPalette(true)}
          >
            <Search size={15} />
          </button>
          <button
            type="button"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[4px] text-codex-muted active:bg-codex-hover active:text-white"
            aria-label="Abrir Lynx AI"
            onClick={() => toggleAISidebar()}
          >
            <Bot size={15} />
          </button>
        </header>

        <main className="relative min-h-0 flex-1 overflow-hidden" {...gestureHandlers}>
          <ActivityBar />
          <SidePanel />
          <section className="relative z-0 ml-11 flex h-full min-w-0 flex-col overflow-hidden">
            <EditorHeader file={currentFile} />
            <CodeEditor file={currentFile} />
          </section>
          <MiniTerminal />
          <AISidebar />
          <SettingsPanel />
          <CommandPalette />
        </main>

        {isProblemsPanelOpen && (
          <ProblemsPanel
            diagnostics={currentDiagnostics}
            fileName={currentFile?.name ?? 'arquivo atual'}
            onGoTo={goToDiagnostic}
            onClose={() => toggleProblemsPanel(false)}
            onNext={goToNextError}
            onPrev={goToPrevError}
          />
        )}

        <KeyboardRow />
        <StatusBar />
      </div>
    </div>
  );
}

export default App;
