import { useCallback } from 'react';
import { useSettingsStore } from '../../store/settingsStore';

interface AnthropicTextBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicTextBlock[];
  error?: {
    message?: string;
  };
}

export function useAI() {
  const settings = useSettingsStore((state) => state.settings);

  const callAnthropic = useCallback(async (system: string, content: string, maxTokens = 600) => {
    if (!settings.anthropicKey.trim()) {
      return 'Configure sua chave da API Anthropic nas Configurações para usar a Lynx AI.';
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content }],
      }),
    });

    const data = await response.json() as AnthropicResponse;

    if (!response.ok) {
      return data.error?.message ?? 'Falha na requisição da AI.';
    }

    return data.content?.map((block) => block.text ?? '').join('').trim() ?? '';
  }, [settings.anthropicKey]);

  const getCompletion = useCallback(async (code: string, cursor: number, lang: string) => {
    const before = code.slice(0, cursor);
    const after = code.slice(cursor);
    const completion = await callAnthropic(
      `You are a code autocomplete engine. Language: ${lang}. Return only code to insert. No markdown, no explanation.`,
      `<before>${before}</before><after>${after}</after>\nComplete the code.`,
      200,
    );

    if (completion.startsWith('Configure sua chave')) {
      return '';
    }

    return completion;
  }, [callAnthropic]);

  const chatAboutCode = useCallback(async (code: string, lang: string, message: string) => {
    return callAnthropic(
      `You are Lynx Studio's mobile coding assistant. Be concise and practical. Current language: ${lang}.`,
      `<file language="${lang}">\n${code}\n</file>\n\nUser question: ${message}`,
      900,
    );
  }, [callAnthropic]);

  return { getCompletion, chatAboutCode };
}
