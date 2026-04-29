import type { LynxDiagnostic } from '../../diagnostics/types';
import type { LanguageWorkerRequest, LanguageWorkerResponse } from './types';

interface PendingRequest {
  resolve: (diagnostics: LynxDiagnostic[]) => void;
  reject: (error: Error) => void;
  timeoutId: number;
}

let requestId = 0;
const pendingRequests = new WeakMap<Worker, Map<number, PendingRequest>>();

function createLanguageWorker(createWorker: () => Worker) {
  let worker: Worker | null = null;

  return () => {
    if (worker) {
      return worker;
    }

    worker = createWorker();
    pendingRequests.set(worker, new Map());

    worker.addEventListener('message', (event: MessageEvent<LanguageWorkerResponse>) => {
      if (!worker) {
        return;
      }

      const workerPending = pendingRequests.get(worker);
      const pending = workerPending?.get(event.data.id);

      if (!pending) {
        return;
      }

      workerPending?.delete(event.data.id);
      window.clearTimeout(pending.timeoutId);

      if (event.data.type === 'diagnostics-error') {
        pending.reject(new Error(event.data.message));
        return;
      }

      pending.resolve(event.data.diagnostics);
    });

    worker.addEventListener('error', (event) => {
      if (!worker) {
        return;
      }

      const error = new Error(event.message || 'Language worker failed');
      const workerPending = pendingRequests.get(worker);

      for (const pending of workerPending?.values() ?? []) {
        window.clearTimeout(pending.timeoutId);
        pending.reject(error);
      }

      workerPending?.clear();
      worker.terminate();
      worker = null;
    });

    return worker;
  };
}

const getTypeScriptWorker = createLanguageWorker(
  () => new Worker(new URL('./workers/typescript.worker.ts', import.meta.url), { type: 'module' }),
);
const getJSONWorker = createLanguageWorker(
  () => new Worker(new URL('./workers/json.worker.ts', import.meta.url), { type: 'module' }),
);
const getCSSWorker = createLanguageWorker(
  () => new Worker(new URL('./workers/css.worker.ts', import.meta.url), { type: 'module' }),
);
const getHTMLWorker = createLanguageWorker(
  () => new Worker(new URL('./workers/html.worker.ts', import.meta.url), { type: 'module' }),
);

function requestDiagnostics(
  worker: Worker,
  code: string,
  language: string,
  fileName?: string,
) {
  const id = requestId += 1;
  const request: LanguageWorkerRequest = {
    id,
    type: 'diagnostics',
    payload: { code, language, fileName },
  };
  const workerPending = pendingRequests.get(worker);

  if (!workerPending) {
    return Promise.reject(new Error('Language worker is not initialized'));
  }

  return new Promise<LynxDiagnostic[]>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      workerPending.delete(id);
      reject(new Error('Language worker timeout'));
    }, 15_000);

    workerPending.set(id, { resolve, reject, timeoutId });
    worker.postMessage(request);
  });
}

export function getTypeScriptDiagnostics(
  code: string,
  language: string,
  fileName?: string,
): Promise<LynxDiagnostic[]> {
  return requestDiagnostics(getTypeScriptWorker(), code, language, fileName);
}

export function getJSONDiagnostics(code: string, language: string, fileName?: string) {
  return requestDiagnostics(getJSONWorker(), code, language, fileName);
}

export function getCSSDiagnostics(code: string, language: string, fileName?: string) {
  return requestDiagnostics(getCSSWorker(), code, language, fileName);
}

export function getHTMLDiagnostics(code: string, language: string, fileName?: string) {
  return requestDiagnostics(getHTMLWorker(), code, language, fileName);
}
