import type { LynxDiagnostic } from '../types';

export function lintPython(code: string): LynxDiagnostic[] {
  const diagnostics: LynxDiagnostic[] = [];
  const lines = code.split('\n');
  let offset = 0;

  lines.forEach((line) => {
    if (/^\s*print\s+[^(]/.test(line)) {
      const column = line.indexOf('print');
      diagnostics.push({
        from: offset + column,
        to: offset + column + 5,
        severity: 'error',
        message: "Python 3: 'print' é uma função — use print() com parênteses",
        source: 'Python',
      });
    }

    if (/==\s*None/.test(line)) {
      const column = line.search(/==\s*None/);
      diagnostics.push({
        from: offset + column,
        to: offset + column + 7,
        severity: 'warning',
        message: "Use 'is None' em vez de '== None' — PEP 8 recomenda comparação por identidade",
        source: 'Python',
      });
    }

    if (/^\s*except\s*:/.test(line)) {
      diagnostics.push({
        from: offset,
        to: offset + line.length,
        severity: 'warning',
        message: "'except:' sem tipo captura TUDO incluindo erros do sistema — especifique: 'except Exception:'",
        source: 'Python',
      });
    }

    if (/^\t+ /.test(line) || /^ +\t/.test(line)) {
      diagnostics.push({
        from: offset,
        to: offset + line.length,
        severity: 'error',
        message: 'Mistura de tabs e espaços na indentação — use somente 4 espaços (PEP 8)',
        source: 'Python',
      });
    }

    if (line.length > 120) {
      diagnostics.push({
        from: offset + 79,
        to: offset + line.length,
        severity: 'hint',
        message: `Linha com ${line.length} caracteres — PEP 8 recomenda máximo de 79`,
        source: 'Python',
      });
    }

    offset += line.length + 1;
  });

  return diagnostics;
}
