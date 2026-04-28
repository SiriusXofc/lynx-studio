import type { LynxDiagnostic } from './types';
import { dedupeDiagnostics } from './markers';
import { lintCSS } from './linters/cssLinter';
import { lintJavaScript } from './linters/javascriptLinter';
import { lintPython } from './linters/pythonLinter';
import {
  getCSSDiagnostics,
  getHTMLDiagnostics,
  getJSONDiagnostics,
} from '../services/language/languageServiceClient';

function offsetToLineCol(code: string, offset: number) {
  const safeOffset = Math.max(0, Math.min(code.length, offset));
  const lines = code.slice(0, safeOffset).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

function finalizeDiagnostics(code: string, diagnostics: LynxDiagnostic[]) {
  return dedupeDiagnostics(diagnostics).map((diagnostic) => {
    const position = diagnostic.line && diagnostic.column
      ? { line: diagnostic.line, column: diagnostic.column }
      : offsetToLineCol(code, diagnostic.from);

    return {
      ...diagnostic,
      ...position,
    };
  });
}

export async function getDiagnosticsForLanguage(code: string, language: string): Promise<LynxDiagnostic[]> {
  const lang = language.toLowerCase();

  if (
    lang.includes('javascript')
    || lang.includes('typescript')
    || lang.includes('jsx')
    || lang.includes('tsx')
  ) {
    const diagnostics = await lintJavaScript(code, language);
    return finalizeDiagnostics(code, diagnostics);
  }

  if (lang.includes('json')) {
    const diagnostics = await getJSONDiagnostics(code, language);
    return finalizeDiagnostics(code, diagnostics);
  }

  if (lang.includes('css') || lang.includes('scss')) {
    const diagnostics = [
      ...await getCSSDiagnostics(code, language),
      ...lintCSS(code),
    ];
    return finalizeDiagnostics(code, diagnostics);
  }

  if (lang.includes('html')) {
    const diagnostics = await getHTMLDiagnostics(code, language);
    return finalizeDiagnostics(code, diagnostics);
  }

  if (lang.includes('python')) {
    const diagnostics = lintPython(code);
    return finalizeDiagnostics(code, diagnostics);
  }

  return [];
}
