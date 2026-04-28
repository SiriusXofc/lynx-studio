import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const gradleFile = resolve(rootDir, 'src-tauri', 'gen', 'android', 'app', 'build.gradle.kts');

if (!existsSync(gradleFile)) {
  throw new Error(`Android Gradle file not found at ${gradleFile}`);
}

let content = readFileSync(gradleFile, 'utf8');

if (!content.includes('import java.io.FileInputStream')) {
  content = `import java.io.FileInputStream\n${content}`;
}

if (!content.includes('import java.util.Properties')) {
  content = `import java.util.Properties\n${content}`;
}

if (!content.includes('val lynxKeystoreProperties = Properties()')) {
  const before = content;
  content = content.replace(
    /\nandroid\s*\{/,
    `
val lynxKeystoreProperties = Properties()
val lynxKeystorePropertiesFile = rootProject.file("keystore.properties")
if (lynxKeystorePropertiesFile.exists()) {
    lynxKeystoreProperties.load(FileInputStream(lynxKeystorePropertiesFile))
}

android {`,
  );

  if (content === before) {
    throw new Error('Could not find the Android block to configure release signing.');
  }
}

if (!content.includes('create("lynxRelease")')) {
  const signingBlock = `
    signingConfigs {
        create("lynxRelease") {
            keyAlias = lynxKeystoreProperties["keyAlias"] as String
            keyPassword = lynxKeystoreProperties["password"] as String
            storeFile = file(lynxKeystoreProperties["storeFile"] as String)
            storePassword = lynxKeystoreProperties["password"] as String
        }
    }

`;

  if (/\n\s*buildTypes\s*\{/.test(content)) {
    content = content.replace(/(\n\s*)buildTypes\s*\{/, `\n${signingBlock}$1buildTypes {`);
  } else if (/\n\s*defaultConfig\s*\{/.test(content)) {
    content = content.replace(/(\n\s*)defaultConfig\s*\{/, `\n${signingBlock}$1defaultConfig {`);
  } else {
    throw new Error('Could not find a safe insertion point for Android signingConfigs.');
  }
}

const signingLine = 'signingConfig = signingConfigs.getByName("lynxRelease")';

if (!content.includes(signingLine)) {
  if (/getByName\("release"\)\s*\{/.test(content)) {
    content = content.replace(
      /getByName\("release"\)\s*\{/,
      `getByName("release") {\n            ${signingLine}`,
    );
  } else if (/\n\s*release\s*\{/.test(content)) {
    content = content.replace(
      /(\n\s*)release\s*\{/,
      `$1release {\n            ${signingLine}`,
    );
  } else if (/\n\s*buildTypes\s*\{/.test(content)) {
    content = content.replace(
      /(\n\s*)buildTypes\s*\{/,
      `$1buildTypes {\n        getByName("release") {\n            ${signingLine}\n        }\n`,
    );
  } else {
    throw new Error('Could not find a release build type to attach Android signing.');
  }
}

writeFileSync(gradleFile, content);
console.log('Android release signing configured.');
