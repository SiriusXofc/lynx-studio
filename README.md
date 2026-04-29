# Lynx Studio

![Lynx Studio](public/lynx-studio-logo.png)

Lynx Studio e um editor de codigo mobile-first criado para aproximar a experiencia do VS Code de uma tela de celular. O objetivo do projeto e permitir que voce abra, navegue, edite e entenda projetos reais em Android, iOS e tambem no PC usando uma janela em formato de telefone para desenvolvimento rapido.

O app nasceu para resolver um problema direto: programar no celular ainda e desconfortavel demais. Por isso a interface prioriza gestos, abas compactas, explorador lateral, fileira extra de simbolos, diagnosticos em tempo real e um editor leve baseado em CodeMirror 6.

## Objetivo

- Editar codigo real em telas pequenas sem depender de um desktop.
- Rodar offline no dispositivo sempre que possivel.
- Reaproveitar ideias solidas do VS Code, mas com uma experiencia desenhada para touch.
- Testar no PC em uma janela fixa de 390 x 844 px, igual ao formato de celular.
- Evoluir para um ambiente mobile completo com Git, terminal, AI e diagnosticos ricos.

## Recursos

- Editor com CodeMirror 6, syntax highlight e line wrapping.
- Abas de arquivos abertas, explorador lateral e busca.
- Keyboard row com simbolos de codigo sempre a mao.
- Diagnosticos em tempo real com squiggles, gutter markers e painel de Problemas.
- Services leves inspirados no VS Code para TypeScript, JSON, CSS/SCSS e HTML.
- Terminal integrado com xterm.js no desktop; no Android ele fica desabilitado ate existir backend real.
- Git basico com isomorphic-git.
- Sidebar de AI com Anthropic para sugestoes e contexto do arquivo.
- Build Tauri v2 para desktop, Android e iOS.

## Stack

- Tauri v2
- React 18 + TypeScript
- CodeMirror 6
- Tailwind CSS
- Zustand
- `@tauri-apps/plugin-fs`, `plugin-os`, `plugin-store`, `plugin-dialog`
- `isomorphic-git`
- `@xterm/xterm`
- Anthropic API

## Desenvolvimento

```bash
npm install
npm run dev
```

Preview web:

```text
http://127.0.0.1:1420
```

Desktop em modo phone frame:

```bash
npm run tauri:dev
```

Android:

```bash
npm run tauri:android:init
npm run tauri:android:build
npm run tauri:android:build:aab
```

## Qualidade

```bash
npm run lint
npm run build
```

## Releases Android

As releases sao geradas pelo GitHub Actions em `.github/workflows/release.yml`. O pipeline:

- instala Node, Rust, Java e Android SDK;
- inicializa o projeto Android do Tauri;
- aplica o nome publico `Lynx Studio`;
- aplica ajustes do runtime Android, incluindo `targetSdk = 35` e `windowSoftInputMode="adjustResize"`;
- assina os artefatos usando secrets do GitHub;
- publica `Lynx-Studio-vX.Y.Z.apk` e `Lynx-Studio-vX.Y.Z.aab` nos assets da release.

## Android

O app Android deve ocupar a tela real do dispositivo. O phone frame de 390 x 844 px e apenas para desktop/dev. Em Android/iOS, a status bar falsa e removida e o layout usa `visualViewport`, `100dvh`, safe areas e `adjustResize` para conviver melhor com teclado virtual e navigation bar.

O explorador usa `tauri-plugin-dialog` para abrir uma pasta pelo seletor nativo. O projeto de exemplo continua disponivel como fallback visual, mas arquivos reais precisam de permissao concedida pelo sistema.

Secrets necessarios no GitHub para release Android:

```text
ANDROID_KEY_ALIAS
ANDROID_KEY_BASE64
ANDROID_KEY_PASSWORD
```

Para criar uma nova release:

```bash
npm version patch --no-git-tag-version
git add package.json package-lock.json src-tauri/tauri.conf.json src-tauri/Cargo.toml CHANGELOG.md
git commit -m "Release vX.Y.Z"
npm run release:tag
```

## Roadmap

- Melhorar os services de linguagem e quick fixes.
- Fortalecer o sistema de arquivos em Android/iOS.
- Adicionar fluxo completo de diff, commit, push e pull.
- Expandir a integracao de AI para explicar erros e aplicar correcoes com confirmacao.
- Refinar terminal mobile com comandos rapidos e multiplas sessoes.

## Licenca

MIT. Veja [LICENSE](LICENSE).
