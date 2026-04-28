import { getLanguageService, TextDocument } from 'vscode-html-languageservice';
import type { LynxDiagnostic } from '../../../diagnostics/types';
import type { LanguageWorkerRequest, LanguageWorkerResponse } from '../types';

const languageService = getLanguageService();
const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

function lintHTMLStructure(code: string, document: TextDocument): LynxDiagnostic[] {
  const diagnostics: LynxDiagnostic[] = [];
  const tagRegex = /<\/?([a-zA-Z][\w:-]*)(?:\s[^<>]*)?>/g;
  const stack: { tag: string; from: number; to: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(code)) !== null) {
    const full = match[0];
    const tag = match[1].toLowerCase();
    const from = match.index;
    const to = from + full.length;
    const isClosing = full.startsWith('</');
    const isSelfClosing = full.endsWith('/>') || VOID_TAGS.has(tag);

    if (isSelfClosing) {
      continue;
    }

    if (isClosing) {
      const last = stack.pop();

      if (!last) {
        diagnostics.push({
          from,
          to,
          severity: 'error',
          message: `Tag de fechamento </${tag}> sem tag de abertura correspondente`,
          source: 'HTML LS',
        });
        continue;
      }

      if (last.tag !== tag) {
        diagnostics.push({
          from,
          to,
          severity: 'error',
          message: `Tag </${tag}> fecha a tag errada — esperado </${last.tag}>`,
          source: 'HTML LS',
        });
      }
      continue;
    }

    stack.push({ tag, from, to });
  }

  for (const openTag of stack.reverse()) {
    const position = document.positionAt(openTag.from);
    diagnostics.push({
      from: openTag.from,
      to: openTag.to,
      severity: 'error',
      message: `Tag <${openTag.tag}> aberta na linha ${position.line + 1} mas nunca fechada`,
      source: 'HTML LS',
    });
  }

  return diagnostics;
}

self.addEventListener('message', (event: MessageEvent<LanguageWorkerRequest>) => {
  try {
    if (event.data.type !== 'diagnostics') {
      return;
    }

    const document = TextDocument.create(
      `file:///workspace/${event.data.payload.fileName ?? 'file.html'}`,
      'html',
      1,
      event.data.payload.code,
    );
    languageService.parseHTMLDocument(document);

    const response: LanguageWorkerResponse = {
      id: event.data.id,
      type: 'diagnostics-result',
      diagnostics: lintHTMLStructure(event.data.payload.code, document),
    };

    self.postMessage(response);
  } catch (error) {
    const response: LanguageWorkerResponse = {
      id: event.data.id,
      type: 'diagnostics-error',
      message: error instanceof Error ? error.message : 'HTML language service failed',
    };

    self.postMessage(response);
  }
});
