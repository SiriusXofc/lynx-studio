import type { LynxDiagnostic } from '../../diagnostics/types';

export type LanguageWorkerRequest =
  | {
      id: number;
      type: 'diagnostics';
      payload: {
        code: string;
        language: string;
        fileName?: string;
      };
    };

export type LanguageWorkerResponse =
  | {
      id: number;
      type: 'diagnostics-result';
      diagnostics: LynxDiagnostic[];
    }
  | {
      id: number;
      type: 'diagnostics-error';
      message: string;
    };
