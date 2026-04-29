import { useCallback } from 'react';
import type { GitFileStatus } from '../types';

type GitModule = typeof import('isomorphic-git');
type GitFs = Parameters<GitModule['currentBranch']>[0]['fs'];

async function loadGit() {
  return import('isomorphic-git');
}

let fsPromise: Promise<GitFs> | null = null;

async function getGitFs() {
  fsPromise ??= import('@isomorphic-git/lightning-fs').then(({ default: LightningFS }) =>
    new LightningFS('lynx-studio-git').promises as GitFs);

  return fsPromise;
}

export function useGit() {
  const getCurrentBranch = useCallback(async (dir: string) => {
    try {
      const [git, fs] = await Promise.all([loadGit(), getGitFs()]);
      return await git.currentBranch({ fs, dir, fullname: false }) ?? 'main';
    } catch {
      return 'main';
    }
  }, []);

  const getStatus = useCallback(async (dir: string) => {
    try {
      const [git, fs] = await Promise.all([loadGit(), getGitFs()]);
      const matrix = await git.statusMatrix({ fs, dir });
      return matrix.map<GitFileStatus>((row) => ({
        filepath: row[0],
        status: `${row[1]}${row[2]}${row[3]}`,
      }));
    } catch {
      return [];
    }
  }, []);

  const getLog = useCallback(async (dir: string) => {
    try {
      const [git, fs] = await Promise.all([loadGit(), getGitFs()]);
      return await git.log({ fs, dir, depth: 20 });
    } catch {
      return [];
    }
  }, []);

  const commit = useCallback(async (dir: string, message: string, author: { name: string; email: string }) => {
    const [git, fs] = await Promise.all([loadGit(), getGitFs()]);
    return git.commit({ fs, dir, message, author });
  }, []);

  return { getCurrentBranch, getStatus, getLog, commit };
}
