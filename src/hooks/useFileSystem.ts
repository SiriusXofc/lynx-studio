import { useCallback } from 'react';
import { join } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
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
  const openFolder = useCallback(async (path: string) => {
    const entries = await readDir(path);
    return Promise.all(entries.map((entry) => entryToNode(path, entry)));
  }, []);

  const openFolderPicker = useCallback(async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Abrir pasta no Lynx Studio',
    });

    if (typeof selected !== 'string') {
      return null;
    }

    return {
      root: selected,
      tree: await openFolder(selected),
    };
  }, [openFolder]);

  const openSampleProject = useCallback(() => sampleTree, []);

  const readFile = useCallback(async (path: string) => {
    return readTextFile(path);
  }, []);

  const saveFile = useCallback(async (path: string, content: string) => {
    await writeTextFile(path, content);
  }, []);

  const createFolder = useCallback(async (path: string) => {
    await mkdir(path, { recursive: true });
  }, []);

  const removePath = useCallback(async (path: string) => {
    await remove(path, { recursive: true });
  }, []);

  const renamePath = useCallback(async (oldPath: string, newPath: string) => {
    await rename(oldPath, newPath);
  }, []);

  return {
    openFolder,
    openFolderPicker,
    openSampleProject,
    readFile,
    saveFile,
    createFolder,
    removePath,
    renamePath,
  };
}
