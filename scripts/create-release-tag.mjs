import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const tag = `v${packageJson.version}`;

function git(args) {
  return execFileSync('git', args, { stdio: 'inherit' });
}

git(['tag', '-a', tag, '-m', `Lynx Studio ${tag}`]);
git(['push', 'origin', tag]);
