import { create } from 'zustand';
import type { FileNode } from '../types';
import { sampleTree } from '../data/sampleProject';

interface FileStore {
  projectRoot: string;
  tree: FileNode[];
  expandedPaths: string[];
  setTree: (tree: FileNode[], root?: string) => void;
  toggleFolder: (path: string) => void;
  markModified: (path: string, modified: boolean) => void;
  flattenFiles: () => FileNode[];
}

function flatten(nodes: FileNode[]): FileNode[] {
  return nodes.flatMap((node) => {
    if (node.type === 'file') {
      return [node];
    }

    return flatten(node.children ?? []);
  });
}

function updateNode(nodes: FileNode[], path: string, update: (node: FileNode) => FileNode): FileNode[] {
  return nodes.map((node) => {
    if (node.path === path) {
      return update(node);
    }

    if (node.children) {
      return { ...node, children: updateNode(node.children, path, update) };
    }

    return node;
  });
}

export const useFileStore = create<FileStore>((set, get) => ({
  projectRoot: '/workspace',
  tree: sampleTree,
  expandedPaths: ['/workspace', '/workspace/src'],

  setTree: (tree, root) => set({ tree, projectRoot: root ?? get().projectRoot }),

  toggleFolder: (path) =>
    set((state) => ({
      expandedPaths: state.expandedPaths.includes(path)
        ? state.expandedPaths.filter((item) => item !== path)
        : [...state.expandedPaths, path],
    })),

  markModified: (path, modified) =>
    set((state) => ({
      tree: updateNode(state.tree, path, (node) => ({ ...node, modified })),
    })),

  flattenFiles: () => flatten(get().tree),
}));
