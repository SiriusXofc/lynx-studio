import type { EditorView } from '@codemirror/view';

export type FileKind = 'file' | 'directory';
export type WorkbenchView = 'explorer' | 'search' | 'source-control' | 'outline';

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: FileKind;
  children?: FileNode[];
  modified?: boolean;
}

export interface OpenFile {
  id: string;
  path: string;
  name: string;
  content: string;
  savedContent: string;
  language: string;
  dirty: boolean;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface AppSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
  theme: 'dark' | 'light';
  fontFamily: string;
  symbols: string[];
  anthropicKey: string;
  aiAutocomplete: boolean;
  aiDelay: number;
  gitUsername: string;
  gitEmail: string;
  diagnostics: DiagnosticsSettings;
}

export interface DiagnosticsSettings {
  enabled: boolean;
  delay: number;
  showGutter: boolean;
  showSquiggles: boolean;
  enabledLanguages: string[];
  aiAssist: boolean;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface GitFileStatus {
  filepath: string;
  status: string;
}

export interface SearchMatch {
  id: string;
  path: string;
  name: string;
  line: number;
  column: number;
  preview: string;
}

export interface OutlineSymbol {
  id: string;
  name: string;
  kind: 'function' | 'class' | 'interface' | 'import' | 'selector' | 'constant' | 'section';
  line: number;
}

export interface CommandAction {
  id: string;
  label: string;
  detail: string;
  run: () => void;
}

export type EditorViewRef = EditorView | null;
