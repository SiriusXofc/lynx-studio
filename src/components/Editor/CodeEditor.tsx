import { useEffect, useMemo, useRef } from 'react';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import type { OpenFile } from '../../types';
import { useEditorStore } from '../../store/editorStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useFileStore } from '../../store/fileStore';
import { useFileSystem } from '../../hooks/useFileSystem';
import { useAI } from '../AI/useAI';
import { EditorEmptyState } from './EditorEmptyState';
import { createEditorExtensions, ghostTextExtension } from './extensions';
import { getLanguageExtension } from './languages';

interface CodeEditorProps {
  file: OpenFile | null;
}

export function CodeEditor({ file }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const aiTimerRef = useRef<number | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const ghostTextCompartmentRef = useRef(new Compartment());
  const initialContentRef = useRef('');
  const setContent = useEditorStore((state) => state.setContent);
  const markSaved = useEditorStore((state) => state.markSaved);
  const setCursor = useEditorStore((state) => state.setCursor);
  const setEditorView = useEditorStore((state) => state.setEditorView);
  const aiGhostText = useEditorStore((state) => state.aiGhostText);
  const setAIGhostText = useEditorStore((state) => state.setAIGhostText);
  const settings = useSettingsStore((state) => state.settings);
  const markModified = useFileStore((state) => state.markModified);
  const { getCompletion } = useAI();
  const fileId = file?.id ?? null;
  const filePath = file?.path ?? '';
  const fileLanguage = file?.language ?? 'Plain Text';
  const fileContent = file?.content ?? '';
  const diagnosticsSettings = settings.diagnostics;
  const { saveFile } = useFileSystem();

  const language = useMemo(() => getLanguageExtension(filePath), [filePath]);

  useEffect(() => {
    initialContentRef.current = fileContent;
  }, [fileContent, fileId]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--editor-font-size', `${settings.fontSize}px`);
    root.style.setProperty('--editor-font-family', settings.fontFamily);
  }, [settings.fontFamily, settings.fontSize]);

  useEffect(() => {
    const view = viewRef.current;

    if (!view) {
      return;
    }

    view.dispatch({
      effects: ghostTextCompartmentRef.current.reconfigure(ghostTextExtension(aiGhostText)),
    });
  }, [aiGhostText]);

  useEffect(() => {
    const host = hostRef.current;

    if (!host || !fileId) {
      return undefined;
    }

    host.innerHTML = '';

    const acceptGhost = () => {
      const view = viewRef.current;
      const ghost = useEditorStore.getState().aiGhostText;

      if (!view || !ghost) {
        return false;
      }

      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: ghost },
        selection: { anchor: from + ghost.length },
      });
      setAIGhostText('');
      view.focus();
      return true;
    };

    const persistContent = async (content: string) => {
      const isVirtualFile = filePath.startsWith('/workspace/') || filePath.startsWith('/untitled-');

      if (!isVirtualFile) {
        await saveFile(filePath, content);
      }

      markSaved(fileId, content);
      markModified(filePath, false);
    };

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.selectionSet) {
        const head = update.state.selection.main.head;
        const line = update.state.doc.lineAt(head);
        setCursor({ line: line.number, column: head - line.from + 1 });
      }

      if (!update.docChanged) {
        return;
      }

      const content = update.state.doc.toString();
      const savedContent = useEditorStore
        .getState()
        .openFiles.find((openFile) => openFile.id === fileId)?.savedContent ?? '';
      setContent(fileId, content);
      markModified(filePath, content !== savedContent);
      setAIGhostText('');

      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }

      if (settings.autoSave) {
        saveTimerRef.current = window.setTimeout(() => {
          void persistContent(content).catch((error) => {
            console.error('Falha ao salvar arquivo.', error);
          });
        }, settings.autoSaveDelay);
      }

      if (aiTimerRef.current) {
        window.clearTimeout(aiTimerRef.current);
      }

      if (settings.aiAutocomplete && settings.anthropicKey) {
        const cursor = update.state.selection.main.head;
        aiTimerRef.current = window.setTimeout(() => {
          void getCompletion(content, cursor, fileLanguage).then((completion) => {
            if (completion) {
              setAIGhostText(completion);
            }
          });
        }, settings.aiDelay);
      }
    });

    const state = EditorState.create({
      doc: initialContentRef.current,
      extensions: createEditorExtensions({
        fileId,
        language,
        languageLabel: fileLanguage,
        theme: settings.theme,
        tabSize: settings.tabSize,
        wordWrap: settings.wordWrap,
        ghostText: useEditorStore.getState().aiGhostText,
        onAcceptGhost: acceptGhost,
        onUpdate: updateListener,
        diagnostics: diagnosticsSettings,
        ghostTextCompartment: ghostTextCompartmentRef.current,
      }),
    });

    const view = new EditorView({ state, parent: host });
    viewRef.current = view;
    setEditorView(view);
    view.focus();

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }

      if (aiTimerRef.current) {
        window.clearTimeout(aiTimerRef.current);
      }

      view.destroy();
      viewRef.current = null;
      setEditorView(null);
    };
  }, [
    fileId,
    fileLanguage,
    filePath,
    getCompletion,
    language,
    markModified,
    markSaved,
    saveFile,
    setAIGhostText,
    setContent,
    setCursor,
    setEditorView,
    settings.aiAutocomplete,
    settings.aiDelay,
    settings.anthropicKey,
    settings.autoSave,
    settings.autoSaveDelay,
    diagnosticsSettings,
    settings.tabSize,
    settings.theme,
    settings.wordWrap,
  ]);

  if (!file) {
    return <EditorEmptyState />;
  }

  return <div ref={hostRef} className="h-full w-full overflow-hidden bg-codex-bg" />;
}
