# Changelog

## v0.1.3 - 2026-04-28

- Corrige o workflow de release para anexar todos os artefatos Android gerados, incluindo APK e AAB.
- Atualiza versionCode Android para 1003.
- Mantem o APK assinado e instalavel como artefato principal da release.

## v0.1.2 - 2026-04-28

- Corrige o layout Android para ocupar a tela real do dispositivo, sem phone frame interno.
- Remove a status bar fake em Android/iOS e adiciona suporte a safe area.
- Ajusta KeyboardRow e StatusBar para nao ficarem sob a navigation bar.
- Corrige o ghost text da AI para nao recriar o CodeMirror a cada sugestao.
- Desativa autocorrect, autocapitalize e spellcheck no editor.
- Reduz falsos positivos do linter em TSX/JSX removendo heuristicas frageis.
- Adiciona file picker nativo com `tauri-plugin-dialog` para abrir pastas reais.
- Melhora tratamento de erro em leitura e salvamento de arquivos.
- Adiciona patches Android gerados para `adjustResize` e `targetSdk = 35`.
- Troca Google Fonts por fontes locais empacotadas.

## v0.1.1 - 2026-04-28

- Corrige o APK Android da release: agora o pipeline exige assinatura e publica um APK instalavel.
- Adiciona secrets de assinatura Android ao fluxo de release.
- Aplica o nome publico `Lynx Studio` no projeto Android gerado.
- Gera o set completo de icones Tauri, Android e iOS a partir da identidade visual do app.
- Atualiza favicon e metadados web para usar a identidade do Lynx Studio.
- Melhora a documentacao do repositorio com objetivo, stack, releases e roadmap.

## v0.1.0 - 2026-04-28

- Primeira release publica do Lynx Studio.
- Editor mobile-first com CodeMirror 6, tabs, explorador, terminal e keyboard row.
- Diagnosticos com squiggles, gutter markers e painel de Problemas.
- Services em workers para TypeScript, JSON, CSS/SCSS e HTML.
- Workflow de release Android com geracao de APK via GitHub Actions.
