import type { FileNode, OpenFile } from '../types';
import { detectLanguageLabel } from '../components/Editor/languages';

const appTsx = `import React, { useState } from 'react';
import { Editor } from './Editor';
import { FileTree } from './FileTree';

interface AppProps {
  theme: 'dark' | 'light';
}

export default function App({ theme }: AppProps) {
  const [file, setFile] = useState('App.tsx');
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <main className="editor-root" data-theme={theme}>
      <FileTree open={drawerOpen} onFile={setFile} />
      <Editor file={file} theme={theme} />
    </main>
  );
}
`;

const editorTs = `import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, history } from '@codemirror/commands';

export function createMobileEditor(parent: HTMLElement, doc: string) {
  const state = EditorState.create({
    doc,
    extensions: [
      history(),
      keymap.of(defaultKeymap),
      EditorView.lineWrapping,
    ],
  });

  return new EditorView({ state, parent });
}
`;

const stylesCss = `/* Lynx Studio mobile editor shell */
.editor-root {
  display: flex;
  height: 100vh;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: 'JetBrains Mono', monospace;
}

.extra-keyboard {
  display: flex;
  gap: 4px;
  padding: 6px;
  background: #1a1a1a;
  border-top: 1px solid #333;
}
`;

const readmeMd = `# Lynx Studio

Mobile-first code editor built with Tauri, React, TypeScript and CodeMirror 6.

The desktop shell opens as a fixed phone-sized window so the mobile interface can be tested without leaving the PC.
`;

export const sampleFiles: Record<string, string> = {
  '/workspace/src/App.tsx': appTsx,
  '/workspace/src/editor.ts': editorTs,
  '/workspace/src/styles.css': stylesCss,
  '/workspace/README.md': readmeMd,
  '/workspace/package.json': `{"name":"lynx-studio-demo","version":"0.1.0","private":true}`,
};

export const sampleTree: FileNode[] = [
  {
    id: '/workspace',
    name: 'lynx-mobile',
    path: '/workspace',
    type: 'directory',
    children: [
      {
        id: '/workspace/src',
        name: 'src',
        path: '/workspace/src',
        type: 'directory',
        children: [
          {
            id: '/workspace/src/App.tsx',
            name: 'App.tsx',
            path: '/workspace/src/App.tsx',
            type: 'file',
          },
          {
            id: '/workspace/src/editor.ts',
            name: 'editor.ts',
            path: '/workspace/src/editor.ts',
            type: 'file',
          },
          {
            id: '/workspace/src/styles.css',
            name: 'styles.css',
            path: '/workspace/src/styles.css',
            type: 'file',
          },
        ],
      },
      {
        id: '/workspace/README.md',
        name: 'README.md',
        path: '/workspace/README.md',
        type: 'file',
      },
      {
        id: '/workspace/package.json',
        name: 'package.json',
        path: '/workspace/package.json',
        type: 'file',
      },
    ],
  },
];

export function createOpenFile(path: string): OpenFile {
  const name = path.split('/').pop() ?? 'untitled.txt';
  const content = sampleFiles[path] ?? '';

  return {
    id: path,
    path,
    name,
    content,
    savedContent: content,
    language: detectLanguageLabel(path),
    dirty: false,
  };
}
