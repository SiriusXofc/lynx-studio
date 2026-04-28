import clsx from 'clsx';
import { X } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useSettingsStore } from '../../store/settingsStore';

interface ToggleProps {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}

function Toggle({ checked, label, onChange }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={clsx(
          'relative h-5 w-9 rounded-full transition-colors',
          checked ? 'bg-codex-accent' : 'bg-[#444444]',
        )}
        onClick={() => onChange(!checked)}
      >
        <span
          className={clsx(
            'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0',
          )}
        />
      </button>
    </label>
  );
}

function SectionDivider() {
  return <div className="border-t border-codex-border" />;
}

export function SettingsPanel() {
  const isOpen = useEditorStore((state) => state.isSettingsOpen);
  const toggleSettings = useEditorStore((state) => state.toggleSettings);
  const settings = useSettingsStore((state) => state.settings);
  const updateSetting = useSettingsStore((state) => state.updateSetting);
  const resetSettings = useSettingsStore((state) => state.resetSettings);
  const updateDiagnostics = <K extends keyof typeof settings.diagnostics>(
    key: K,
    value: (typeof settings.diagnostics)[K],
  ) => updateSetting('diagnostics', { ...settings.diagnostics, [key]: value });

  return (
    <aside
      className={clsx(
        'absolute inset-y-0 right-0 z-40 flex w-[300px] max-w-[86vw] flex-col border-l border-codex-border bg-codex-panel shadow-2xl transition-[transform,box-shadow] duration-200',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-codex-border px-3">
        <div>
          <div className="font-sans text-xs text-white">Configurações</div>
          <div className="font-sans text-[10px] text-codex-muted">Preferências do editor mobile</div>
        </div>
        <button
          type="button"
          className="grid h-7 w-7 place-items-center rounded-[4px] text-codex-muted active:bg-codex-hover active:text-white"
          onClick={() => toggleSettings(false)}
          aria-label="Fechar configurações"
        >
          <X size={15} />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-3 font-sans text-xs text-codex-text">
        <section className="space-y-2">
          <h2 className="text-[11px] uppercase tracking-[1px] text-codex-muted">Editor</h2>
          <label className="flex items-center justify-between gap-3">
            <span>Tamanho da fonte</span>
            <input
              type="number"
              min={10}
              max={22}
              value={settings.fontSize}
              className="h-8 w-20 rounded-[4px] border border-codex-border bg-codex-bg px-2 text-right outline-none"
              onChange={(event) => updateSetting('fontSize', Number(event.target.value))}
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Tamanho do tab</span>
            <input
              type="number"
              min={2}
              max={8}
              value={settings.tabSize}
              className="h-8 w-20 rounded-[4px] border border-codex-border bg-codex-bg px-2 text-right outline-none"
              onChange={(event) => updateSetting('tabSize', Number(event.target.value))}
            />
          </label>
          <Toggle
            label="Quebra de linha"
            checked={settings.wordWrap}
            onChange={(value) => updateSetting('wordWrap', value)}
          />
          <Toggle
            label="Salvar automaticamente"
            checked={settings.autoSave}
            onChange={(value) => updateSetting('autoSave', value)}
          />
        </section>

        <SectionDivider />

        <section className="space-y-2">
          <h2 className="text-[11px] uppercase tracking-[1px] text-codex-muted">Aparência</h2>
          <label className="space-y-1">
            <span>Tema</span>
            <select
              value={settings.theme}
              className="h-8 w-full rounded-[4px] border border-codex-border bg-codex-bg px-2 outline-none"
              onChange={(event) => updateSetting('theme', event.target.value as 'dark' | 'light')}
            >
              <option value="dark">Dark+</option>
              <option value="light">Light</option>
            </select>
          </label>
          <label className="space-y-1">
            <span>Fonte</span>
            <input
              value={settings.fontFamily}
              className="h-8 w-full rounded-[4px] border border-codex-border bg-codex-bg px-2 outline-none"
              onChange={(event) => updateSetting('fontFamily', event.target.value)}
            />
          </label>
        </section>

        <SectionDivider />

        <section className="space-y-2">
          <h2 className="text-[11px] uppercase tracking-[1px] text-codex-muted">Diagnósticos</h2>
          <Toggle
            label="Ativar diagnósticos"
            checked={settings.diagnostics.enabled}
            onChange={(value) => updateDiagnostics('enabled', value)}
          />
          <Toggle
            label="Marcadores na gutter"
            checked={settings.diagnostics.showGutter}
            onChange={(value) => updateDiagnostics('showGutter', value)}
          />
          <Toggle
            label="Sublinhados no código"
            checked={settings.diagnostics.showSquiggles}
            onChange={(value) => updateDiagnostics('showSquiggles', value)}
          />
          <Toggle
            label="Assistência por AI"
            checked={settings.diagnostics.aiAssist}
            onChange={(value) => updateDiagnostics('aiAssist', value)}
          />
          <label className="flex items-center justify-between gap-3">
            <span>Atraso</span>
            <input
              type="number"
              min={200}
              step={50}
              value={settings.diagnostics.delay}
              className="h-8 w-24 rounded-[4px] border border-codex-border bg-codex-bg px-2 text-right outline-none"
              onChange={(event) => updateDiagnostics('delay', Number(event.target.value))}
            />
          </label>
        </section>

        <SectionDivider />

        <section className="space-y-2">
          <h2 className="text-[11px] uppercase tracking-[1px] text-codex-muted">AI</h2>
          <input
            type="password"
            value={settings.anthropicKey}
            className="h-8 w-full rounded-[4px] border border-codex-border bg-codex-bg px-2 outline-none"
            placeholder="Chave da API Anthropic"
            onChange={(event) => updateSetting('anthropicKey', event.target.value)}
          />
          <Toggle
            label="Autocomplete"
            checked={settings.aiAutocomplete}
            onChange={(value) => updateSetting('aiAutocomplete', value)}
          />
          <label className="flex items-center justify-between gap-3">
            <span>Atraso</span>
            <input
              type="number"
              min={250}
              step={50}
              value={settings.aiDelay}
              className="h-8 w-24 rounded-[4px] border border-codex-border bg-codex-bg px-2 text-right outline-none"
              onChange={(event) => updateSetting('aiDelay', Number(event.target.value))}
            />
          </label>
        </section>

        <SectionDivider />

        <section className="space-y-2">
          <h2 className="text-[11px] uppercase tracking-[1px] text-codex-muted">Git</h2>
          <input
            value={settings.gitUsername}
            className="h-8 w-full rounded-[4px] border border-codex-border bg-codex-bg px-2 outline-none"
            placeholder="Usuário"
            onChange={(event) => updateSetting('gitUsername', event.target.value)}
          />
          <input
            value={settings.gitEmail}
            className="h-8 w-full rounded-[4px] border border-codex-border bg-codex-bg px-2 outline-none"
            placeholder="Email"
            onChange={(event) => updateSetting('gitEmail', event.target.value)}
          />
        </section>
      </div>

      <div className="shrink-0 border-t border-codex-border p-3">
        <button
          type="button"
          className="h-8 w-full rounded-[4px] border border-codex-border font-sans text-xs text-codex-text active:bg-codex-hover"
          onClick={resetSettings}
        >
          Restaurar configurações
        </button>
      </div>
    </aside>
  );
}
