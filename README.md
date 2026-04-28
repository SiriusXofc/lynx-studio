# Lynx Studio

Lynx Studio é um editor de código mobile-first feito com Tauri v2, React, TypeScript e CodeMirror 6. A interface foi pensada para rodar em Android/iOS e também no PC em uma janela fixa no formato de celular.

## Stack

- Tauri v2
- React 18 + TypeScript
- CodeMirror 6
- Tailwind CSS
- Zustand
- `@tauri-apps/plugin-fs`, `plugin-os`, `plugin-store`
- `isomorphic-git`
- Anthropic API para recursos de AI
- Language services inspirados no VSCode para diagnósticos

## Desenvolvimento

```bash
npm install
npm run dev
```

O preview web roda em:

```text
http://127.0.0.1:1420
```

## Build

Frontend:

```bash
npm run lint
npm run build
```

Desktop Tauri:

```bash
npm run tauri:build
```

Android:

```bash
npm run tauri:android:init
npm run tauri:android:build
```

## Releases

O workflow `.github/workflows/release.yml` gera APK automaticamente quando uma tag `v*` é enviada para o GitHub.

Exemplo:

```bash
npm version patch --no-git-tag-version
git add package.json package-lock.json src-tauri/tauri.conf.json src-tauri/Cargo.toml
git commit -m "chore: bump version"
npm run release:tag
```

Depois disso, o GitHub Actions cria uma release e anexa o APK nos assets.

## Observações sobre Android

O APK gerado pelo workflow usa o pipeline padrão do Tauri Android. Para publicação em loja, configure assinatura Android com secrets no GitHub e ajuste o projeto gerado em `src-tauri/gen/android`.

## Licença

MIT
