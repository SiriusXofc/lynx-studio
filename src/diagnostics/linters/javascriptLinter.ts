import type { LynxDiagnostic } from '../types';
import { getTypeScriptDiagnostics } from '../../services/language/languageServiceClient';

export async function lintJavaScript(code: string, language = 'TypeScript'): Promise<LynxDiagnostic[]> {
  const diagnostics = await getTypeScriptDiagnostics(code, language);
  const languageServiceErrorRanges = diagnostics
    .filter((diagnostic) => diagnostic.severity === 'error')
    .map((diagnostic) => ({ from: diagnostic.from, to: diagnostic.to }));

  diagnostics.push(
    ...lintJavaScriptPatterns(code).filter((diagnostic) =>
      !languageServiceErrorRanges.some((range) =>
        diagnostic.severity === 'error'
        && range.from <= diagnostic.to
        && range.to >= diagnostic.from)),
  );

  return diagnostics;
}

function lintJavaScriptPatterns(code: string): LynxDiagnostic[] {
  const diagnostics: LynxDiagnostic[] = [];
  const lines = code.split('\n');
  let offset = 0;

  lines.forEach((line) => {
    const match = line.match(/console\.log\([^)]*$/);

    if (match) {
      diagnostics.push({
        from: offset + (match.index ?? 0),
        to: offset + line.length,
        severity: 'error',
        message: "Parêntese de fechamento ')' faltando no console.log()",
        source: 'JavaScript',
      });
    }

    offset += line.length + 1;
  });

  const awaitRegex = /^(?!.*\basync\b).*\bawait\b/gm;
  let match: RegExpExecArray | null;

  while ((match = awaitRegex.exec(code)) !== null) {
    const before = code.slice(0, match.index);
    const asyncCount = (before.match(/\basync\s+(function|\(|[a-z])/g) ?? []).length;
    const closingCount = (before.match(/^}/gm) ?? []).length;

    if (asyncCount <= closingCount) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'error',
        message: "'await' usado fora de uma função 'async' — adicione 'async' na função que contém este código",
        source: 'JavaScript',
      });
    }
  }

  const assignInIf = /\bif\s*\(\s*[^=!<>]+=[^=]/g;

  while ((match = assignInIf.exec(code)) !== null) {
    diagnostics.push({
      from: match.index,
      to: match.index + match[0].length,
      severity: 'warning',
      message: "Atribuição '=' dentro de condição. Você quis usar '===' para comparar?",
      source: 'JavaScript',
    });
  }

  const varRegex = /\bvar\s+\w/g;

  while ((match = varRegex.exec(code)) !== null) {
    diagnostics.push({
      from: match.index,
      to: match.index + 3,
      severity: 'warning',
      message: "Use 'const' ou 'let' em vez de 'var' — 'var' tem escopo de função e pode causar bugs",
      source: 'JavaScript',
    });
  }

  const looseEqual = /(?<!=|!)={2}(?!=)(?!\s*null\b)(?!\s*undefined\b)/g;

  while ((match = looseEqual.exec(code)) !== null) {
    diagnostics.push({
      from: match.index,
      to: match.index + 2,
      severity: 'warning',
      message: "Use '===' para comparação estrita. '==' converte tipos automaticamente e pode causar bugs inesperados",
      source: 'JavaScript',
    });
  }

  const importWithoutFrom = /^import\s+(?!type\s)[\w{},\s*]+\s*$/gm;

  while ((match = importWithoutFrom.exec(code)) !== null) {
    if (!match[0].includes('from')) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].trim().length,
        severity: 'error',
        message: "Import incompleto: faltando 'from' e o caminho do módulo. Ex: import React from 'react'",
        source: 'JavaScript',
      });
    }
  }

  diagnostics.push(
    ...checkUnmatchedBrackets(code).filter((bracketDiagnostic) =>
      !diagnostics.some((diagnostic) =>
        diagnostic.severity === 'error'
        && bracketDiagnostic.from >= diagnostic.from
        && bracketDiagnostic.to <= diagnostic.to)),
  );

  return diagnostics;
}

function checkUnmatchedBrackets(code: string): LynxDiagnostic[] {
  const diagnostics: LynxDiagnostic[] = [];
  const stack: { char: string; pos: number }[] = [];
  const opens: Record<string, string> = { '(': ')', '{': '}', '[': ']' };
  const closes = new Set([')', '}', ']']);

  let inString = false;
  let stringChar = '';
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < code.length; i += 1) {
    const char = code[i];
    const next = code[i + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (!inString && char === '/' && next === '/') {
      inLineComment = true;
      i += 1;
      continue;
    }

    if (!inString && char === '/' && next === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }

    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true;
      stringChar = char;
      continue;
    }

    if (inString) {
      if (char === stringChar && code[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }

    if (opens[char]) {
      stack.push({ char, pos: i });
      continue;
    }

    if (closes.has(char)) {
      if (stack.length === 0 || opens[stack[stack.length - 1].char] !== char) {
        diagnostics.push({
          from: i,
          to: i + 1,
          severity: 'error',
          message: `'${char}' sem correspondente — faltando o caractere de abertura`,
          source: 'JavaScript',
        });
      } else {
        stack.pop();
      }
    }
  }

  for (const { char, pos } of stack) {
    diagnostics.push({
      from: pos,
      to: pos + 1,
      severity: 'error',
      message: `'${char}' aberto mas nunca fechado — faltando '${opens[char]}'`,
      source: 'JavaScript',
    });
  }

  return diagnostics;
}
