import { create } from 'zustand';
import type { CursorPosition, EditorViewRef, OpenFile, WorkbenchView } from '../types';
import type { LynxDiagnostic } from '../diagnostics/types';
import { createOpenFile } from '../data/sampleProject';
import { detectLanguageLabel } from '../components/Editor/languages';

interface EditorStore {
  openFiles: OpenFile[];
  currentFileId: string | null;
  cursor: CursorPosition;
  branch: string;
  activeView: WorkbenchView;
  editorView: EditorViewRef;
  aiGhostText: string;
  diagnosticsByFileId: Record<string, LynxDiagnostic[]>;
  isFileTreeOpen: boolean;
  isCommandPaletteOpen: boolean;
  isAISidebarOpen: boolean;
  isSettingsOpen: boolean;
  isTerminalOpen: boolean;
  isProblemsPanelOpen: boolean;
  getContent: (id: string) => string;
  setContent: (id: string, content: string) => void;
  setDiagnostics: (fileId: string, diagnostics: LynxDiagnostic[]) => void;
  getAllDiagnostics: () => LynxDiagnostic[];
  openTab: (path: string, content?: string) => void;
  closeTab: (id: string) => void;
  switchTab: (id: string) => void;
  createUntitled: () => void;
  markSaved: (id: string, content?: string) => void;
  setCursor: (cursor: CursorPosition) => void;
  setBranch: (branch: string) => void;
  setActiveView: (view: WorkbenchView) => void;
  toggleWorkbenchView: (view: WorkbenchView) => void;
  setEditorView: (view: EditorViewRef) => void;
  setAIGhostText: (text: string) => void;
  toggleFileTree: (open?: boolean) => void;
  toggleCommandPalette: (open?: boolean) => void;
  toggleAISidebar: (open?: boolean) => void;
  toggleSettings: (open?: boolean) => void;
  toggleTerminal: (open?: boolean) => void;
  toggleProblemsPanel: (open?: boolean) => void;
}

const initialFiles = [
  createOpenFile('/workspace/src/App.tsx'),
  createOpenFile('/workspace/src/editor.ts'),
];

function nextOpenFilesAfterClose(files: OpenFile[], id: string) {
  const index = files.findIndex((file) => file.id === id);
  const remaining = files.filter((file) => file.id !== id);
  const fallback = remaining[Math.max(0, index - 1)] ?? remaining[0];
  return { remaining, fallbackId: fallback?.id ?? null };
}

function diagnosticsEqual(a: LynxDiagnostic[], b: LynxDiagnostic[]) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((diagnostic, index) => {
    const other = b[index];
    return diagnostic.from === other.from
      && diagnostic.to === other.to
      && diagnostic.severity === other.severity
      && diagnostic.message === other.message
      && diagnostic.source === other.source;
  });
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  openFiles: initialFiles,
  currentFileId: initialFiles[0].id,
  cursor: { line: 1, column: 1 },
  branch: 'main',
  activeView: 'explorer',
  editorView: null,
  aiGhostText: '',
  diagnosticsByFileId: {},
  isFileTreeOpen: false,
  isCommandPaletteOpen: false,
  isAISidebarOpen: false,
  isSettingsOpen: false,
  isTerminalOpen: false,
  isProblemsPanelOpen: false,

  getContent: (id) => get().openFiles.find((file) => file.id === id)?.content ?? '',

  setContent: (id, content) =>
    set((state) => ({
      openFiles: state.openFiles.map((file) =>
        file.id === id
          ? { ...file, content, dirty: content !== file.savedContent }
          : file,
      ),
    })),

  setDiagnostics: (fileId, diagnostics) =>
    set((state) => {
      const nextDiagnostics = Array.isArray(diagnostics) ? diagnostics : [];
      const current = state.diagnosticsByFileId[fileId] ?? [];

      if (diagnosticsEqual(current, nextDiagnostics)) {
        return state;
      }

      return {
        diagnosticsByFileId: {
          ...state.diagnosticsByFileId,
          [fileId]: nextDiagnostics,
        },
      };
    }),

  getAllDiagnostics: () => Object.values(get().diagnosticsByFileId).flat(),

  openTab: (path, content) =>
    set((state) => {
      const existing = state.openFiles.find((file) => file.path === path);

      if (existing) {
        return {
          currentFileId: existing.id,
          isFileTreeOpen: false,
          aiGhostText: '',
        };
      }

      const file = content === undefined
        ? createOpenFile(path)
        : {
            id: path,
            path,
            name: path.split('/').pop() ?? 'untitled.txt',
            content,
            savedContent: content,
            language: detectLanguageLabel(path),
            dirty: false,
          };

      return {
        openFiles: [...state.openFiles, file],
        currentFileId: file.id,
        isFileTreeOpen: false,
        aiGhostText: '',
      };
    }),

  closeTab: (id) =>
    set((state) => {
      const { remaining, fallbackId } = nextOpenFilesAfterClose(state.openFiles, id);
      const diagnosticsByFileId = { ...state.diagnosticsByFileId };
      delete diagnosticsByFileId[id];

      return {
        openFiles: remaining,
        currentFileId: state.currentFileId === id ? fallbackId : state.currentFileId,
        diagnosticsByFileId,
        aiGhostText: '',
      };
    }),

  switchTab: (id) => set({ currentFileId: id, aiGhostText: '' }),

  createUntitled: () =>
    set((state) => {
      const count = state.openFiles.filter((file) => file.path.startsWith('/untitled-')).length + 1;
      const path = `/untitled-${count}.ts`;
      const file: OpenFile = {
        id: path,
        path,
        name: `untitled-${count}.ts`,
        content: '',
        savedContent: '',
        language: 'TypeScript',
        dirty: true,
      };

      return {
        openFiles: [...state.openFiles, file],
        currentFileId: file.id,
        aiGhostText: '',
      };
    }),

  markSaved: (id, content) =>
    set((state) => ({
      openFiles: state.openFiles.map((file) => {
        if (file.id !== id) {
          return file;
        }

        const savedContent = content ?? file.content;
        return { ...file, content: savedContent, savedContent, dirty: false };
      }),
    })),

  setCursor: (cursor) => set({ cursor }),
  setBranch: (branch) => set({ branch }),
  setEditorView: (view) => set({ editorView: view }),
  setAIGhostText: (text) => set({ aiGhostText: text }),
  setActiveView: (view) => set({ activeView: view, isFileTreeOpen: true }),
  toggleWorkbenchView: (view) =>
    set((state) => ({
      activeView: view,
      isFileTreeOpen: state.activeView === view ? !state.isFileTreeOpen : true,
    })),
  toggleFileTree: (open) =>
    set((state) => ({
      activeView: 'explorer',
      isFileTreeOpen: open ?? !state.isFileTreeOpen,
    })),
  toggleCommandPalette: (open) =>
    set((state) => ({ isCommandPaletteOpen: open ?? !state.isCommandPaletteOpen })),
  toggleAISidebar: (open) => set((state) => ({ isAISidebarOpen: open ?? !state.isAISidebarOpen })),
  toggleSettings: (open) => set((state) => ({ isSettingsOpen: open ?? !state.isSettingsOpen })),
  toggleTerminal: (open) => set((state) => ({ isTerminalOpen: open ?? !state.isTerminalOpen })),
  toggleProblemsPanel: (open) =>
    set((state) => ({ isProblemsPanelOpen: open ?? !state.isProblemsPanelOpen })),
}));
