import type { EditorView } from '@codemirror/view';

export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'hint';

export interface LynxDiagnostic {
  from: number;
  to: number;
  line?: number;
  column?: number;
  severity: DiagnosticSeverity;
  message: string;
  source?: string;
  actions?: LynxDiagnosticAction[];
}

export interface LynxDiagnosticAction {
  name: string;
  apply: (view: EditorView, from?: number, to?: number) => void;
}

export type DiagnosticAction = LynxDiagnosticAction;
