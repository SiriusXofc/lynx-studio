import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stringsFile = resolve(
  rootDir,
  'src-tauri',
  'gen',
  'android',
  'app',
  'src',
  'main',
  'res',
  'values',
  'strings.xml',
);

if (!existsSync(stringsFile)) {
  console.warn(`Android strings.xml not found at ${stringsFile}; skipping app label patch.`);
  process.exit(0);
}

let xml = readFileSync(stringsFile, 'utf8');

if (xml.includes('name="app_name"')) {
  xml = xml.replace(
    /<string\s+name="app_name">.*?<\/string>/,
    '<string name="app_name">Lynx Studio</string>',
  );
} else {
  xml = xml.replace(
    /<\/resources>/,
    '    <string name="app_name">Lynx Studio</string>\n</resources>',
  );
}

writeFileSync(stringsFile, xml);
console.log('Android app label set to Lynx Studio.');
