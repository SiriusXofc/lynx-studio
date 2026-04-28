import ts from 'typescript';
import type { LynxDiagnostic } from '../../../diagnostics/types';
import type { LanguageWorkerRequest, LanguageWorkerResponse } from '../types';

const LYNX_LIB_FILE = '/lynx/mobile-lib.d.ts';
const LYNX_LIB_SOURCE = `
type Awaited<T> = T;
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Record<K extends keyof any, T> = { [P in K]: T };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type NonNullable<T> = T & {};

interface Array<T> { length: number; [n: number]: T; }
interface ReadonlyArray<T> { readonly length: number; readonly [n: number]: T; }
interface Promise<T> { then<TResult>(onfulfilled?: (value: T) => TResult | Promise<TResult>): Promise<TResult>; catch<TResult>(onrejected?: (reason: any) => TResult | Promise<TResult>): Promise<TResult>; }
interface PromiseConstructor { resolve<T>(value: T): Promise<T>; reject<T = never>(reason?: any): Promise<T>; }
declare const Promise: PromiseConstructor;

interface Console { log(...data: any[]): void; warn(...data: any[]): void; error(...data: any[]): void; info(...data: any[]): void; }
declare const console: Console;

interface Response { ok: boolean; status: number; json(): Promise<any>; text(): Promise<string>; }
declare function fetch(input: string, init?: any): Promise<Response>;

declare const window: any;
declare const document: any;
declare const localStorage: any;
declare const setTimeout: any;
declare const clearTimeout: any;

declare module 'react' {
  export const useCallback: any;
  export const useEffect: any;
  export const useMemo: any;
  export const useRef: any;
  export const useState: any;
  const React: any;
  export default React;
}

declare namespace JSX {
  interface IntrinsicElements { [elementName: string]: any; }
}
`;

let currentFileName = '/workspace/file.tsx';
let currentCode = '';
let version = 0;

const files = new Map<string, { text: string; version: number }>([
  [LYNX_LIB_FILE, { text: LYNX_LIB_SOURCE, version: 1 }],
]);

const compilerOptions: ts.CompilerOptions = {
  allowJs: true,
  allowSyntheticDefaultImports: true,
  checkJs: false,
  esModuleInterop: true,
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  noLib: true,
  skipLibCheck: true,
  strict: true,
  target: ts.ScriptTarget.ES2022,
};

const host: ts.LanguageServiceHost = {
  getCompilationSettings: () => compilerOptions,
  getScriptFileNames: () => [LYNX_LIB_FILE, currentFileName],
  getScriptVersion: (fileName) => String(files.get(fileName)?.version ?? 0),
  getScriptSnapshot: (fileName) => {
    const file = files.get(fileName);
    return file ? ts.ScriptSnapshot.fromString(file.text) : undefined;
  },
  getCurrentDirectory: () => '/workspace',
  getDefaultLibFileName: () => '',
  fileExists: (fileName) => files.has(fileName),
  readFile: (fileName) => files.get(fileName)?.text,
  readDirectory: () => [],
  directoryExists: () => true,
  getDirectories: () => [],
  useCaseSensitiveFileNames: () => true,
  getNewLine: () => '\n',
};

const languageService = ts.createLanguageService(host, ts.createDocumentRegistry());

function fileNameForLanguage(language: string, fileName?: string) {
  if (fileName) {
    return fileName.startsWith('/') ? fileName : `/workspace/${fileName}`;
  }

  const normalized = language.toLowerCase();
  const isReact = normalized.includes('react') || normalized.includes('jsx') || normalized.includes('tsx');
  const isTypeScript = normalized.includes('type');

  if (isTypeScript) {
    return isReact ? '/workspace/file.tsx' : '/workspace/file.ts';
  }

  return isReact ? '/workspace/file.jsx' : '/workspace/file.js';
}

function updateVirtualFile(code: string, language: string, fileName?: string) {
  const nextFileName = fileNameForLanguage(language, fileName);

  if (nextFileName !== currentFileName) {
    files.delete(currentFileName);
    currentFileName = nextFileName;
  }

  if (code !== currentCode) {
    version += 1;
    currentCode = code;
  }

  files.set(currentFileName, { text: currentCode, version });
}

function translateDiagnostic(message: string) {
  const exact: Record<string, string> = {
    "')' expected.": "Parêntese ')' esperado.",
    "'(' expected.": "Parêntese '(' esperado.",
    "'}' expected.": "Chave '}' esperada.",
    "'{' expected.": "Chave '{' esperada.",
    "']' expected.": "Colchete ']' esperado.",
    "'[' expected.": "Colchete '[' esperado.",
    "';' expected.": 'Ponto e vírgula esperado.',
    "',' expected.": 'Vírgula esperada.',
    "'=' expected.": "Sinal '=' esperado.",
    'Expression expected.': 'Expressão esperada.',
    'Declaration or statement expected.': 'Declaração ou comando esperado.',
  };

  if (exact[message]) {
    return exact[message];
  }

  if (message.startsWith('Unexpected token.')) {
    return `Token inesperado — ${message}`;
  }

  return message;
}

function diagnosticSeverity(category: ts.DiagnosticCategory) {
  if (category === ts.DiagnosticCategory.Warning) {
    return 'warning';
  }

  if (category === ts.DiagnosticCategory.Suggestion) {
    return 'hint';
  }

  if (category === ts.DiagnosticCategory.Message) {
    return 'info';
  }

  return 'error';
}

function shouldSkipDiagnostic(diagnostic: ts.Diagnostic) {
  const ignoredCodes = new Set([
    2307,
    7016,
  ]);

  return ignoredCodes.has(diagnostic.code);
}

function toLynxDiagnostic(diagnostic: ts.Diagnostic, language: string): LynxDiagnostic | null {
  if (shouldSkipDiagnostic(diagnostic) || diagnostic.start === undefined) {
    return null;
  }

  const from = Math.max(0, diagnostic.start);
  const length = Math.max(1, diagnostic.length ?? 1);
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

  return {
    from,
    to: Math.min(currentCode.length, from + length),
    severity: diagnosticSeverity(diagnostic.category),
    message: translateDiagnostic(message),
    source: language.toLowerCase().includes('type') ? 'TypeScript LS' : 'JavaScript LS',
  };
}

function getDiagnostics(code: string, language: string, fileName?: string) {
  updateVirtualFile(code, language, fileName);

  return [
    ...languageService.getSyntacticDiagnostics(currentFileName),
    ...languageService.getSemanticDiagnostics(currentFileName),
    ...languageService.getSuggestionDiagnostics(currentFileName),
  ]
    .map((diagnostic) => toLynxDiagnostic(diagnostic, language))
    .filter((diagnostic): diagnostic is LynxDiagnostic => Boolean(diagnostic));
}

self.addEventListener('message', (event: MessageEvent<LanguageWorkerRequest>) => {
  try {
    if (event.data.type !== 'diagnostics') {
      return;
    }

    const diagnostics = getDiagnostics(
      event.data.payload.code,
      event.data.payload.language,
      event.data.payload.fileName,
    );
    const response: LanguageWorkerResponse = {
      id: event.data.id,
      type: 'diagnostics-result',
      diagnostics,
    };

    self.postMessage(response);
  } catch (error) {
    const response: LanguageWorkerResponse = {
      id: event.data.id,
      type: 'diagnostics-error',
      message: error instanceof Error ? error.message : 'TypeScript language service failed',
    };

    self.postMessage(response);
  }
});
