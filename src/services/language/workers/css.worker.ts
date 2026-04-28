import {
  DiagnosticSeverity,
  getCSSLanguageService,
  getLESSLanguageService,
  getSCSSLanguageService,
  TextDocument,
  type Diagnostic,
} from 'vscode-css-languageservice';
import type { LynxDiagnostic } from '../../../diagnostics/types';
import type { LanguageWorkerRequest, LanguageWorkerResponse } from '../types';

const cssService = getCSSLanguageService();
const scssService = getSCSSLanguageService();
const lessService = getLESSLanguageService();

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

function translateCSSMessage(message: string) {
  if (message.includes('Unknown property')) {
    return message.replace('Unknown property', 'Propriedade desconhecida');
  }

  if (message.includes('at-rule or selector expected')) {
    return 'Esperado seletor ou at-rule CSS';
  }

  if (message.includes('property value expected')) {
    return 'Valor da propriedade esperado';
  }

  if (message.includes('semi-colon expected')) {
    return "Ponto e vírgula ';' esperado";
  }

  if (message.includes('Do not use empty rulesets')) {
    return 'Evite rulesets vazios';
  }

  return message;
}

function getService(language: string) {
  const normalized = language.toLowerCase();

  if (normalized.includes('scss')) {
    return { service: scssService, languageId: 'scss', fileName: 'file.scss' };
  }

  if (normalized.includes('less')) {
    return { service: lessService, languageId: 'less', fileName: 'file.less' };
  }

  return { service: cssService, languageId: 'css', fileName: 'file.css' };
}

self.addEventListener('message', (event: MessageEvent<LanguageWorkerRequest>) => {
  try {
    if (event.data.type !== 'diagnostics') {
      return;
    }

    const { service, languageId, fileName } = getService(event.data.payload.language);
    const document = TextDocument.create(
      `file:///workspace/${event.data.payload.fileName ?? fileName}`,
      languageId,
      1,
      event.data.payload.code,
    );
    const stylesheet = service.parseStylesheet(document);
    const diagnostics = service.doValidation(document, stylesheet, {
      validate: true,
      lint: {
        unknownProperties: 'error',
        zeroUnits: 'warning',
        duplicateProperties: 'warning',
        emptyRules: 'warning',
        importStatement: 'ignore',
      },
    });
    const response: LanguageWorkerResponse = {
      id: event.data.id,
      type: 'diagnostics-result',
      diagnostics: diagnostics.map((diagnostic) => ({
        from: document.offsetAt(diagnostic.range.start),
        to: Math.max(document.offsetAt(diagnostic.range.end), document.offsetAt(diagnostic.range.start) + 1),
        severity: toSeverity(diagnostic.severity),
        message: translateCSSMessage(diagnostic.message),
        source: languageId.toUpperCase() + ' LS',
      })),
    };

    self.postMessage(response);
  } catch (error) {
    const response: LanguageWorkerResponse = {
      id: event.data.id,
      type: 'diagnostics-error',
      message: error instanceof Error ? error.message : 'CSS language service failed',
    };

    self.postMessage(response);
  }
});
