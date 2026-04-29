# Changelog

## v0.1.2 - 2026-04-28

- Corrige o layout Android para ocupar a tela real do dispositivo, sem phone frame interno.
- Remove a status bar fake em Android/iOS e adiciona suporte a safe area.
- Ajusta KeyboardRow e StatusBar para não ficarem sob a navigation bar.
- Corrige o ghost text da AI para não recriar o CodeMirror a cada sugestão.
- Desativa autocorrect/autocapitalize/spellcheck no editor.
- Reduz falsos positivos do linter em TSX/JSX removendo heurísticas frágeis.
- Adiciona file picker nativo com `tauri-plugin-dialog` para abrir pastas reais.
- Melhora tratamento de erro em leitura/salvamento de arquivos.
- Adiciona patches Android gerados para `adjustResize` e `targetSdk = 35`.
- Passa a publicar APK e AAB assinados nas releases.
- Troca Google Fonts por fontes locais empacotadas.

## v0.1.1 - 2026-04-28

- Corrige o APK Android da release: agora o pipeline exige assinatura e publica um APK instalável.
- Adiciona secrets de assinatura Android ao fluxo de release.
- Aplica o nome público `Lynx Studio` no projeto Android gerado.
- Gera o set completo de ícones Tauri, Android e iOS a partir da identidade visual do app.
- Atualiza favicon e metadados web para usar a identidade do Lynx Studio.
- Melhora a documentação do repositório com objetivo, stack, releases e roadmap.

## v0.1.0 - 2026-04-28

- Primeira release pública do Lynx Studio.
- Editor mobile-first com CodeMirror 6, tabs, explorador, terminal e keyboard row.
- Diagnósticos com squiggles, gutter markers e painel de Problemas.
- Services em workers para TypeScript, JSON, CSS/SCSS e HTML.
- Workflow de release Android com geração de APK via GitHub Actions.
