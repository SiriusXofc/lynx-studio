import type { DiagnosticSeverity, LynxDiagnostic } from './types';

export const LynxMarkerSeverity = {
  Hint: 1,
  Info: 2,
  Warning: 4,
  Error: 8,
} as const;

type LynxMarkerSeverityValue = (typeof LynxMarkerSeverity)[keyof typeof LynxMarkerSeverity];

const SEVERITY_TO_MARKER: Record<DiagnosticSeverity, LynxMarkerSeverityValue> = {
  hint: LynxMarkerSeverity.Hint,
  info: LynxMarkerSeverity.Info,
  warning: LynxMarkerSeverity.Warning,
  error: LynxMarkerSeverity.Error,
};

export function compareDiagnostics(a: LynxDiagnostic, b: LynxDiagnostic) {
  return SEVERITY_TO_MARKER[b.severity] - SEVERITY_TO_MARKER[a.severity]
    || a.from - b.from
    || a.to - b.to;
}

export function makeDiagnosticKey(diagnostic: LynxDiagnostic) {
  return [
    diagnostic.source ?? '',
    diagnostic.severity,
    diagnostic.message,
    diagnostic.from,
    diagnostic.to,
  ].join('|');
}

export function dedupeDiagnostics(diagnostics: LynxDiagnostic[]) {
  const processed = new Set<string>();
  const result: LynxDiagnostic[] = [];

  for (const diagnostic of diagnostics) {
    const key = makeDiagnosticKey(diagnostic);

    if (processed.has(key)) {
      continue;
    }

    processed.add(key);
    result.push(diagnostic);
  }

  return result.sort(compareDiagnostics);
}
