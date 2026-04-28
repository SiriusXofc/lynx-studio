import type { Extension } from '@codemirror/state';
import { StreamLanguage } from '@codemirror/language';
import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { shell } from '@codemirror/legacy-modes/mode/shell';

export function getExtension(path: string) {
  return path.slice(path.lastIndexOf('.')).toLowerCase();
}

export function detectLanguageLabel(path: string) {
  const extension = getExtension(path);

  if (extension === '.tsx') return 'TypeScript React';
  if (extension === '.ts') return 'TypeScript';
  if (extension === '.jsx') return 'JavaScript React';
  if (extension === '.js') return 'JavaScript';
  if (extension === '.py') return 'Python';
  if (extension === '.css' || extension === '.scss') return 'CSS';
  if (extension === '.html') return 'HTML';
  if (extension === '.json') return 'JSON';
  if (extension === '.rs') return 'Rust';
  if (extension === '.cpp' || extension === '.cc' || extension === '.c' || extension === '.h') return 'C++';
  if (extension === '.java') return 'Java';
  if (extension === '.md') return 'Markdown';
  if (extension === '.sh') return 'Shell';
  return 'Plain Text';
}

export function getLanguageExtension(path: string): Extension {
  const extension = getExtension(path);

  if (extension === '.tsx') return javascript({ jsx: true, typescript: true });
  if (extension === '.ts') return javascript({ typescript: true });
  if (extension === '.jsx') return javascript({ jsx: true });
  if (extension === '.js') return javascript();
  if (extension === '.py') return python();
  if (extension === '.css' || extension === '.scss') return css();
  if (extension === '.html') return html();
  if (extension === '.json') return json();
  if (extension === '.rs') return rust();
  if (extension === '.cpp' || extension === '.cc' || extension === '.c' || extension === '.h') return cpp();
  if (extension === '.java') return java();
  if (extension === '.md') return markdown();
  if (extension === '.sh') return StreamLanguage.define(shell);
  return [];
}

export function getFileBadge(path: string) {
  const extension = getExtension(path);

  if (extension === '.tsx' || extension === '.jsx') return { label: 'RX', color: '#61dafb' };
  if (extension === '.ts') return { label: 'TS', color: '#3178c6' };
  if (extension === '.js') return { label: 'JS', color: '#f7df1e' };
  if (extension === '.css' || extension === '.scss') return { label: '#', color: '#ce9178' };
  if (extension === '.html') return { label: '<>', color: '#e34c26' };
  if (extension === '.json') return { label: '{}', color: '#b5cea8' };
  if (extension === '.rs') return { label: 'RS', color: '#dea584' };
  if (extension === '.py') return { label: 'PY', color: '#ffd43b' };
  if (extension === '.md') return { label: 'MD', color: '#9cdcfe' };
  return { label: '..', color: '#888888' };
}
