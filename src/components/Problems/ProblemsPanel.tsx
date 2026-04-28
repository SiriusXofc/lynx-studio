import { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  Search,
  X,
} from 'lucide-react';
import type { LynxDiagnostic } from '../../diagnostics/types';

interface ProblemsPanelProps {
  diagnostics: LynxDiagnostic[];
  fileName: string;
  onGoTo: (from: number) => void;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const SEVERITY_CONFIG = {
  error: { icon: AlertCircle, color: '#F14C4C', label: 'Erro' },
  warning: { icon: AlertTriangle, color: '#CCA700', label: 'Aviso' },
  info: { icon: Info, color: '#59a4f9', label: 'Info' },
  hint: { icon: Lightbulb, color: '#eeeeee', label: 'Dica' },
};

const SEVERITY_ORDER = {
  error: 0,
  warning: 1,
  info: 2,
  hint: 3,
};

export function ProblemsPanel({
  diagnostics,
  fileName,
  onGoTo,
  onClose,
  onNext,
  onPrev,
}: ProblemsPanelProps) {
  const [filter, setFilter] = useState('');
  const [showErrors, setShowErrors] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [showInfos, setShowInfos] = useState(true);

  const errorCount = diagnostics.filter((diagnostic) => diagnostic.severity === 'error').length;
  const warningCount = diagnostics.filter((diagnostic) => diagnostic.severity === 'warning').length;
  const infoCount = diagnostics.filter((diagnostic) =>
    diagnostic.severity === 'info' || diagnostic.severity === 'hint').length;

  const sorted = useMemo(() => {
    const normalizedFilter = filter.trim().toLowerCase();

    return [...diagnostics]
      .filter((diagnostic) => {
        if (diagnostic.severity === 'error' && !showErrors) {
          return false;
        }

        if (diagnostic.severity === 'warning' && !showWarnings) {
          return false;
        }

        if ((diagnostic.severity === 'info' || diagnostic.severity === 'hint') && !showInfos) {
          return false;
        }

        if (!normalizedFilter) {
          return true;
        }

        return `${diagnostic.message} ${diagnostic.source ?? ''}`
          .toLowerCase()
          .includes(normalizedFilter);
      })
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.from - b.from);
  }, [diagnostics, filter, showErrors, showInfos, showWarnings]);

  return (
    <div className="flex max-h-[40vh] shrink-0 flex-col border-t border-[#333] bg-[#252526]">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-[#333] px-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[1px] text-[#bbbbbb]">
            Problemas
          </span>
          {errorCount > 0 && (
            <button
              type="button"
              className="flex items-center gap-1 font-sans text-[11px] active:opacity-70"
              style={{ color: '#F14C4C' }}
              onClick={() => setShowErrors((value) => !value)}
            >
              <AlertCircle size={11} />
              {errorCount}
            </button>
          )}
          {warningCount > 0 && (
            <button
              type="button"
              className="flex items-center gap-1 font-sans text-[11px] active:opacity-70"
              style={{ color: '#CCA700' }}
              onClick={() => setShowWarnings((value) => !value)}
            >
              <AlertTriangle size={11} />
              {warningCount}
            </button>
          )}
          {infoCount > 0 && (
            <button
              type="button"
              className="flex items-center gap-1 font-sans text-[11px] active:opacity-70"
              style={{ color: '#59a4f9' }}
              onClick={() => setShowInfos((value) => !value)}
            >
              <Info size={11} />
              {infoCount}
            </button>
          )}
          {errorCount === 0 && warningCount === 0 && infoCount === 0 && (
            <span className="font-sans text-[11px] text-[#4ec9b0]">Nenhum problema</span>
          )}
          <span className="min-w-0 max-w-[92px] truncate font-sans text-[10px] text-[#666]">
            {fileName}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-[4px] text-[#888] active:bg-[#094771] active:text-white"
            onClick={onPrev}
            aria-label="Problema anterior"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-[4px] text-[#888] active:bg-[#094771] active:text-white"
            onClick={onNext}
            aria-label="Próximo problema"
          >
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-[4px] text-[#888] active:bg-[#094771] active:text-white"
            onClick={onClose}
            aria-label="Fechar problemas"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <label className="flex h-8 shrink-0 items-center gap-2 border-b border-[#333] px-3 font-sans text-[11px] text-[#888]">
        <Search size={12} />
        <input
          value={filter}
          className="min-w-0 flex-1 bg-transparent text-[#cccccc] outline-none placeholder:text-[#666]"
          placeholder="Filtrar problemas"
          onChange={(event) => setFilter(event.target.value)}
        />
      </label>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="px-4 py-3 font-sans text-[12px] text-[#666]">
            Nenhum problema encontrado em {fileName}
          </div>
        ) : (
          sorted.map((diagnostic, index) => {
            const config = SEVERITY_CONFIG[diagnostic.severity];
            const Icon = config.icon;

            return (
              <button
                type="button"
                key={`${diagnostic.from}-${diagnostic.to}-${diagnostic.message}-${index}`}
                className="flex w-full items-start gap-2 border-b border-[#2a2a2a] px-3 py-2 text-left active:bg-[#094771]"
                onClick={() => onGoTo(diagnostic.from)}
              >
                <Icon size={13} style={{ color: config.color, marginTop: 2, flexShrink: 0 }} />
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-[12px] leading-snug text-[#d4d4d4]">
                    {diagnostic.message}
                  </p>
                  <p className="mt-0.5 truncate font-sans text-[10px] text-[#666]">
                    {diagnostic.source ?? 'Lynx'} {'\u00b7'} Ln {diagnostic.line ?? '?'}, Col {diagnostic.column ?? '?'} {'\u00b7'} {config.label}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
