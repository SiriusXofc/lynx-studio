import {
  DiagnosticSeverity,
  getLanguageService,
  TextDocument,
  type Diagnostic,
} from 'vscode-json-languageservice';
import type { LynxDiagnostic } from '../../../diagnostics/types';
import type { LanguageWorkerRequest, LanguageWorkerResponse } from '../types';

const languageService = getLanguageService({});
languageService.configure({
  validate: true,
  allowComments: false,
});

function toSeverity(severity: Diagnostic['severity']): LynxDiagnostic['severity'] {
  if (severity === DiagnosticSeverity.Warning) {
    return 'warning';
  }

  if (severity === DiagnosticSeverity.Information) {
    return 'info';
  }

  if (severity === DiagnosticSeverity.Hint) {
    return 'hint';
  }

  return 'error';
}

function translateJSONMessage(message: string) {
  if (message.includes('Trailing comma')) {
    return 'Vírgula extra no final — JSON não aceita trailing comma';
  }

  if (message.includes('Comments are not permitted')) {
    return 'JSON não suporta comentários — remova este trecho';
  }

  if (message.includes('Expected double-quoted property name')) {
    return 'Chaves JSON precisam de aspas duplas (")';
  }

  if (message.includes('Expected comma')) {
    return 'Vírgula esperada — verifique a estrutura do JSON';
  }

  if (message.includes('Expected colon')) {
    return "Dois pontos ':' esperados após a chave";
  }

  if (message.includes('End of file expected')) {
    return 'Fim do arquivo esperado — há conteúdo extra depois do JSON';
  }

  return message;
}

function diagnosticsFromLSP(document: TextDocument, diagnostics: Diagnostic[]): LynxDiagnostic[] {
  return diagnostics.map((diagnostic) => ({
    from: document.offsetAt(diagnostic.range.start),
    to: Math.max(document.offsetAt(diagnostic.range.end), document.offsetAt(diagnostic.range.start) + 1),
    severity: toSeverity(diagnostic.severity),
    message: translateJSONMessage(diagnostic.message),
    source: 'JSON LS',
  }));
}

self.addEventListener('message', async (event: MessageEvent<LanguageWorkerRequest>) => {
  try {
    if (event.data.type !== 'diagnostics') {
      return;
    }

    const uri = `file:///workspace/${event.data.payload.fileName ?? 'file.json'}`;
    const document = TextDocument.create(uri, 'json', 1, event.data.payload.code);
    const jsonDocument = languageService.parseJSONDocument(document);
    const diagnostics = await languageService.doValidation(document, jsonDocument, {
      comments: 'error',
      trailingCommas: 'error',
      schemaValidation: 'warning',
      schemaRequest: 'ignore',
    });
    const response: LanguageWorkerResponse = {
      id: event.data.id,
      type: 'diagnostics-result',
      diagnostics: diagnosticsFromLSP(document, diagnostics),
    };

    self.postMessage(response);
  } catch (error) {
    const response: LanguageWorkerResponse = {
      id: event.data.id,
      type: 'diagnostics-error',
      message: error instanceof Error ? error.message : 'JSON language service failed',
    };

    self.postMessage(response);
  }
});
