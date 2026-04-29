import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const androidDir = resolve(rootDir, 'src-tauri', 'gen', 'android');
const appGradleFile = resolve(androidDir, 'app', 'build.gradle.kts');
const manifestFile = resolve(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml');

function patchGradle() {
  if (!existsSync(appGradleFile)) {
    console.warn(`Android app build.gradle.kts not found at ${appGradleFile}; skipping SDK patch.`);
    return;
  }

  let content = readFileSync(appGradleFile, 'utf8');

  if (/targetSdk\s*=/.test(content)) {
    content = content.replace(/targetSdk\s*=\s*\d+/, 'targetSdk = 35');
  } else if (/targetSdkVersion\(\d+\)/.test(content)) {
    content = content.replace(/targetSdkVersion\(\d+\)/, 'targetSdkVersion(35)');
  } else if (/defaultConfig\s*\{/.test(content)) {
    content = content.replace(/defaultConfig\s*\{/, 'defaultConfig {\n        targetSdk = 35');
  }

  writeFileSync(appGradleFile, content);
  console.log('Android targetSdk set to 35.');
}

function patchManifest() {
  if (!existsSync(manifestFile)) {
    console.warn(`AndroidManifest.xml not found at ${manifestFile}; skipping soft input patch.`);
    return;
  }

  let content = readFileSync(manifestFile, 'utf8');

  if (/android:windowSoftInputMode=/.test(content)) {
    content = content.replace(/android:windowSoftInputMode="[^"]*"/, 'android:windowSoftInputMode="adjustResize"');
  } else {
    content = content.replace(/<activity\b/, '<activity android:windowSoftInputMode="adjustResize"');
  }

  writeFileSync(manifestFile, content);
  console.log('Android windowSoftInputMode set to adjustResize.');
}

patchGradle();
patchManifest();
