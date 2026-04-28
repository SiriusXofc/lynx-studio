import type { LynxDiagnostic } from '../types';

const TYPOS: Record<string, string> = {
  colour: 'color',
  backround: 'background',
  marggin: 'margin',
  paddin: 'padding',
  dipslay: 'display',
  flext: 'flex',
  heigth: 'height',
  widht: 'width',
  boreder: 'border',
  positon: 'position',
  overfow: 'overflow',
};

export function lintCSS(code: string): LynxDiagnostic[] {
  const diagnostics: LynxDiagnostic[] = [];
  let match: RegExpExecArray | null;

  for (const [typo, correct] of Object.entries(TYPOS)) {
    const regex = new RegExp(`\\b${typo}\\s*:`, 'gi');

    while ((match = regex.exec(code)) !== null) {
      diagnostics.push({
        from: match.index,
        to: match.index + typo.length,
        severity: 'error',
        message: `Propriedade desconhecida '${typo}' — você quis dizer '${correct}'?`,
        source: 'CSS',
      });
    }
  }

  const hexRe = /#([0-9a-fA-F]+)\b/g;

  while ((match = hexRe.exec(code)) !== null) {
    const length = match[1].length;

    if (length !== 3 && length !== 6 && length !== 8) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'error',
        message: `Cor hex '#${match[1]}' inválida (${length} dígitos) — use 3, 6 ou 8 dígitos. Ex: #fff, #ffffff`,
        source: 'CSS',
      });
    }
  }

  const noUnit = /:\s*(\d+)\s*;/g;

  while ((match = noUnit.exec(code)) !== null) {
    const value = Number.parseInt(match[1], 10);

    if (value !== 0) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'warning',
        message: `Valor '${match[1]}' sem unidade — faltando px, em, rem, %, vh, vw etc?`,
        source: 'CSS',
      });
    }
  }

  let open = 0;
  let lastOpenPos = 0;

  for (let i = 0; i < code.length; i += 1) {
    if (code[i] === '{') {
      open += 1;
      lastOpenPos = i;
    }

    if (code[i] === '}') {
      open -= 1;
    }
  }

  if (open > 0) {
    diagnostics.push({
      from: lastOpenPos,
      to: lastOpenPos + 1,
      severity: 'error',
      message: `${open} bloco(s) CSS aberto(s) sem fechar — faltando '}'`,
      source: 'CSS',
    });
  }

  return diagnostics;
}
