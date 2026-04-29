# Lynx Studio

![Lynx Studio](public/lynx-studio-logo.png)

Lynx Studio é um editor de código mobile-first criado para aproximar a experiência do VS Code de uma tela de celular. O objetivo do projeto é permitir que você abra, navegue, edite e entenda projetos reais em Android, iOS e também no PC usando uma janela em formato de telefone para desenvolvimento rápido.

O app nasceu para resolver um problema direto: programar no celular ainda é desconfortável demais. Por isso a interface prioriza gestos, abas compactas, explorador lateral, fileira extra de símbolos, diagnósticos em tempo real e um editor leve baseado em CodeMirror 6.

## Objetivo

- Editar código real em telas pequenas sem depender de um desktop.
- Rodar offline no dispositivo sempre que possível.
- Reaproveitar ideias sólidas do VS Code, mas com uma experiência desenhada para touch.
- Testar no PC em uma janela fixa de 390 x 844 px, igual ao formato de celular.
- Evoluir para um ambiente mobile completo com Git, terminal, AI e diagnósticos ricos.

## Recursos

- Editor com CodeMirror 6, syntax highlight e line wrapping.
- Abas de arquivos abertas, explorador lateral e busca.
- Keyboard row com símbolos de código sempre à mão.
- Diagnósticos em tempo real com squiggles, gutter markers e painel de Problemas.
- Services leves inspirados no VS Code para TypeScript, JSON, CSS/SCSS e HTML.
- Terminal integrado com xterm.js.
- Git básico com isomorphic-git.
- Sidebar de AI com Anthropic para sugestões e contexto do arquivo.
- Build Tauri v2 para desktop, Android e iOS.

## Stack

- Tauri v2
- React 18 + TypeScript
- CodeMirror 6
- Tailwind CSS
- Zustand
- `@tauri-apps/plugin-fs`, `plugin-os`, `plugin-store`
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
```

## Qualidade

```bash
npm run lint
npm run build
```

## Releases Android

As releases são geradas pelo GitHub Actions em `.github/workflows/release.yml`. O pipeline:

- instala Node, Rust, Java e Android SDK;
- inicializa o projeto Android do Tauri;
- aplica o nome público `Lynx Studio`;
- aplica ajustes do runtime Android, incluindo `targetSdk = 35` e `windowSoftInputMode="adjustResize"`;
- assina o APK usando secrets do GitHub;
- publica `Lynx-Studio-vX.Y.Z.apk` e `Lynx-Studio-vX.Y.Z.aab` nos assets da release.

## Android

O app Android deve ocupar a tela real do dispositivo. O phone frame de 390 x 844 px é apenas para desktop/dev. Em Android/iOS, a status bar falsa é removida e o layout usa `visualViewport`, `100dvh`, safe areas e `adjustResize` para conviver melhor com teclado virtual e navigation bar.

O explorador usa `tauri-plugin-dialog` para abrir uma pasta pelo seletor nativo. O projeto de exemplo continua disponível como fallback visual, mas arquivos reais precisam de permissão concedida pelo sistema.

Secrets necessários no GitHub para release Android:

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
- Expandir a integração de AI para explicar erros e aplicar correções com confirmação.
- Refinar terminal mobile com comandos rápidos e múltiplas sessões.

## Licença

MIT. Veja [LICENSE](LICENSE).
