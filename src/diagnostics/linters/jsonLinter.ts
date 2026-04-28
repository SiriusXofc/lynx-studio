import type { LynxDiagnostic } from '../types';

export function lintJSON(code: string): LynxDiagnostic[] {
  const diagnostics: LynxDiagnostic[] = [];

  if (!code.trim()) {
    return diagnostics;
  }

  const trailing = /,(\s*)[}\]]/g;
  let match: RegExpExecArray | null;

  while ((match = trailing.exec(code)) !== null) {
    diagnostics.push({
      from: match.index,
      to: match.index + 1,
      severity: 'error',
      message: `Vírgula extra antes de '${code[match.index + 1 + match[1].length]}' — JSON não aceita trailing comma`,
      source: 'JSON',
    });
  }

  const singleQuoteKeys = /'([^']+)'\s*:/g;

  while ((match = singleQuoteKeys.exec(code)) !== null) {
    diagnostics.push({
      from: match.index,
      to: match.index + match[0].length,
      severity: 'error',
      message: `Chave '${match[1]}' com aspas simples — JSON exige aspas duplas: "${match[1]}"`,
      source: 'JSON',
    });
  }

  const comments = /\/\/[^\n]*|\/\*[\s\S]*?\*\//g;

  while ((match = comments.exec(code)) !== null) {
    diagnostics.push({
      from: match.index,
      to: match.index + match[0].length,
      severity: 'error',
      message: 'JSON não suporta comentários — remova este trecho',
      source: 'JSON',
    });
  }

  try {
    JSON.parse(code);
  } catch (error: unknown) {
    if (error instanceof SyntaxError && diagnostics.length === 0) {
      const message = error.message;
      const posMatch = message.match(/position (\d+)/);
      const pos = posMatch ? Number.parseInt(posMatch[1], 10) : 0;
      let friendly = message;

      if (message.includes("Unexpected token '}'")) {
        friendly = "Chave '}' inesperada — verifique se não há vírgula extra ou propriedade incompleta";
      } else if (message.includes("Unexpected token ','")) {
        friendly = 'Vírgula inesperada — verifique a estrutura do JSON';
      } else if (message.includes('Unexpected end')) {
        friendly = "JSON incompleto — faltando fechar alguma chave '}' ou colchete ']'";
      } else if (message.includes('Unexpected token')) {
        friendly = `Erro de sintaxe: ${message} — verifique aspas e vírgulas`;
      }

      diagnostics.push({
        from: Math.max(0, pos - 1),
        to: Math.min(code.length, pos + 2),
        severity: 'error',
        message: friendly,
        source: 'JSON',
      });
    }
  }

  return diagnostics;
}
