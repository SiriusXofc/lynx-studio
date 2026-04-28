import { create } from 'zustand';
import type { AppSettings } from '../types';

export const defaultSymbols = [
  '{}',
  '[]',
  '()',
  '<>',
  ';',
  ':',
  '=',
  '=>',
  '/',
  '|',
  '&',
  '!',
  '.',
  ',',
  '"',
  "'",
  '`',
  '#',
  '@',
  '\\n',
  'TAB',
  'DEL',
  'AI',
];

export const defaultSettings: AppSettings = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  autoSave: true,
  autoSaveDelay: 1000,
  theme: 'dark',
  fontFamily: 'JetBrains Mono',
  symbols: defaultSymbols,
  anthropicKey: '',
  aiAutocomplete: true,
  aiDelay: 800,
  gitUsername: '',
  gitEmail: '',
  diagnostics: {
    enabled: true,
    delay: 500,
    showGutter: true,
    showSquiggles: true,
    enabledLanguages: ['javascript', 'typescript', 'jsx', 'tsx', 'json', 'css', 'scss', 'html', 'python'],
    aiAssist: false,
  },
};

interface SettingsStore {
  settings: AppSettings;
  hydrate: () => Promise<void>;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
}

async function persistSettings(settings: AppSettings) {
  localStorage.setItem('lynx-studio-settings', JSON.stringify(settings));

  try {
    const { load } = await import('@tauri-apps/plugin-store');
    const store = await load('settings.json', {
      defaults: { settings: defaultSettings },
      autoSave: 100,
    });
    await store.set('settings', settings);
    await store.save();
  } catch {
    // Browser preview keeps using localStorage.
  }
}

function normalizeSettings(settings: Partial<AppSettings>): AppSettings {
  return {
    ...defaultSettings,
    ...settings,
    diagnostics: {
      ...defaultSettings.diagnostics,
      ...settings.diagnostics,
    },
  };
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,

  hydrate: async () => {
    const local = localStorage.getItem('lynx-studio-settings');

    if (local) {
      set({ settings: normalizeSettings(JSON.parse(local) as Partial<AppSettings>) });
    }

    try {
      const { load } = await import('@tauri-apps/plugin-store');
      const store = await load('settings.json', {
        defaults: { settings: defaultSettings },
        autoSave: 100,
      });
      const stored = await store.get<Partial<AppSettings>>('settings');

      if (stored) {
        set({ settings: normalizeSettings(stored) });
      }
    } catch {
      // Tauri store is unavailable in normal Vite preview.
    }
  },

  updateSetting: (key, value) => {
    const settings = { ...get().settings, [key]: value };
    set({ settings });
    void persistSettings(settings);
  },

  resetSettings: () => {
    set({ settings: defaultSettings });
    void persistSettings(defaultSettings);
  },
}));
