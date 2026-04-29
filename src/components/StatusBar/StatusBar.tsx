import { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, GitBranch } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

function formatTime() {
  const date = new Date();
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function TopStatusBar() {
  const [time, setTime] = useState(formatTime);

  useEffect(() => {
    const interval = window.setInterval(() => setTime(formatTime()), 10_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex h-11 shrink-0 items-center justify-between bg-[#111111] px-5 pt-2 font-sans text-[11px] text-codex-muted">
      <span>{time}</span>
      <span className="tracking-[2px]">&#9650; &#9679; &#9646;&#9646;</span>
    </div>
  );
}

export function StatusBar() {
  const branch = useEditorStore((state) => state.branch);
  const cursor = useEditorStore((state) => state.cursor);
  const currentFileId = useEditorStore((state) => state.currentFileId);
  const openFiles = useEditorStore((state) => state.openFiles);
  const diagnosticsByFileId = useEditorStore((state) => state.diagnosticsByFileId);
  const toggleProblemsPanel = useEditorStore((state) => state.toggleProblemsPanel);
  const currentFile = openFiles.find((file) => file.id === currentFileId);
  const fileDiagnostics = currentFileId ? diagnosticsByFileId[currentFileId] : [];
  const diagnostics = Array.isArray(fileDiagnostics) ? fileDiagnostics : [];
  const errorCount = diagnostics.filter((diagnostic) => diagnostic.severity === 'error').length;
  const warningCount = diagnostics.filter((diagnostic) => diagnostic.severity === 'warning').length;

  return (
    <div className="lynx-status-bar flex min-h-7 shrink-0 items-center justify-between gap-2 bg-codex-accent px-2 font-sans text-[10px] text-white">
      <span className="flex min-w-0 items-center gap-1">
        <GitBranch size={12} className="shrink-0" />
        <span className="max-w-[58px] truncate">{branch}</span>
        {errorCount > 0 && (
          <button
            type="button"
            className="flex h-6 items-center gap-1 rounded-[3px] px-1.5 active:bg-[#1f8ad2]"
            onClick={() => toggleProblemsPanel()}
            aria-label="Abrir erros"
          >
            <AlertCircle size={11} style={{ color: '#F14C4C' }} />
            <span>{errorCount}</span>
          </button>
        )}
        {warningCount > 0 && (
          <button
            type="button"
            className="flex h-6 items-center gap-1 rounded-[3px] px-1.5 active:bg-[#1f8ad2]"
            onClick={() => toggleProblemsPanel()}
            aria-label="Abrir avisos"
          >
            <AlertTriangle size={11} style={{ color: '#CCA700' }} />
            <span>{warningCount}</span>
          </button>
        )}
        {errorCount === 0 && warningCount === 0 && (
          <span className="flex h-6 items-center px-1">
            <CheckCircle size={11} style={{ color: '#4ec9b0' }} />
          </span>
        )}
      </span>
      <span className="shrink-0">Ln {cursor.line}, Col {cursor.column}</span>
      <span className="min-w-0 truncate">{currentFile?.language ?? 'Plain Text'} {'\u00b7'} UTF-8</span>
    </div>
  );
}
