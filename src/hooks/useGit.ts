import { useCallback, useMemo } from 'react';
import LightningFS from '@isomorphic-git/lightning-fs';
import type { GitFileStatus } from '../types';

async function loadGit() {
  return import('isomorphic-git');
}

export function useGit() {
  const fs = useMemo(() => new LightningFS('lynx-studio-git').promises, []);

  const getCurrentBranch = useCallback(async (dir: string) => {
    try {
      const git = await loadGit();
      return await git.currentBranch({ fs, dir, fullname: false }) ?? 'main';
    } catch {
      return 'main';
    }
  }, [fs]);

  const getStatus = useCallback(async (dir: string) => {
    try {
      const git = await loadGit();
      const matrix = await git.statusMatrix({ fs, dir });
      return matrix.map<GitFileStatus>((row) => ({
        filepath: row[0],
        status: `${row[1]}${row[2]}${row[3]}`,
      }));
    } catch {
      return [];
    }
  }, [fs]);

  const getLog = useCallback(async (dir: string) => {
    try {
      const git = await loadGit();
      return await git.log({ fs, dir, depth: 20 });
    } catch {
      return [];
    }
  }, [fs]);

  const commit = useCallback(async (dir: string, message: string, author: { name: string; email: string }) => {
    const git = await loadGit();
    return git.commit({ fs, dir, message, author });
  }, [fs]);

  return { getCurrentBranch, getStatus, getLog, commit };
}
