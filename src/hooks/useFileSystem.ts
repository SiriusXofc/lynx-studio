import { join } from '@tauri-apps/api/path';
import {
  mkdir,
  readDir,
  readTextFile,
  remove,
  rename,
  writeTextFile,
  type DirEntry,
} from '@tauri-apps/plugin-fs';
import type { FileNode } from '../types';
import { sampleTree } from '../data/sampleProject';

async function entryToNode(parent: string, entry: DirEntry): Promise<FileNode> {
  const path = await join(parent, entry.name);

  if (!entry.isDirectory) {
    return {
      id: path,
      name: entry.name,
      path,
      type: 'file',
    };
  }

  const children = await readDir(path);

  return {
    id: path,
    name: entry.name,
    path,
    type: 'directory',
    children: await Promise.all(children.map((child) => entryToNode(path, child))),
  };
}

export function useFileSystem() {
  const openFolder = async (path: string) => {
    try {
      const entries = await readDir(path);
      return Promise.all(entries.map((entry) => entryToNode(path, entry)));
    } catch {
      return sampleTree;
    }
  };

  const readFile = async (path: string) => {
    return readTextFile(path);
  };

  const saveFile = async (path: string, content: string) => {
    await writeTextFile(path, content);
  };

  const createFolder = async (path: string) => {
    await mkdir(path, { recursive: true });
  };

  const removePath = async (path: string) => {
    await remove(path, { recursive: true });
  };

  const renamePath = async (oldPath: string, newPath: string) => {
    await rename(oldPath, newPath);
  };

  return { openFolder, readFile, saveFile, createFolder, removePath, renamePath };
}
