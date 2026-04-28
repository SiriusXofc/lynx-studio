# PROMPT PARA OUTRA IA — Auditoria Android Completa do Lynx Studio

Você é uma IA sênior de engenharia mobile, frontend e Tauri. Analise o projeto anexado em `.zip` como se fosse um aplicativo Android real em produção. O app se chama **Lynx Studio**: um editor de código mobile-first feito com **Tauri v2 + React 18 + TypeScript + CodeMirror 6 + Tailwind + Zustand**, inspirado no VS Code, mas pensado para celular.

Sua tarefa NÃO é apenas elogiar ou listar ideias vagas. Sua tarefa é fazer uma auditoria brutalmente prática e criar um arquivo Markdown chamado:

```text
AUDITORIA_ANDROID_LYNX_STUDIO_RELATORIO.md
```

Esse relatório será enviado para outro agente de implementação corrigir tudo. Portanto, seja específico, cite arquivos, explique causa provável, risco, prioridade e correção recomendada.

---

## 1. Contexto do Projeto

O Lynx Studio pretende ser um editor de código para Android/iOS com:

- edição real de código no celular;
- file tree / explorador lateral;
- abas de arquivos;
- CodeMirror 6 com syntax highlighting;
- diagnósticos com squiggles e painel de problemas;
- keyboard row extra com símbolos de código;
- terminal embutido;
- Git básico;
- AI assistente;
- build Android via Tauri v2.

O app também roda no PC em uma janela estilo celular, mas **no Android ele deve ocupar a tela real do dispositivo**, respeitando status bar, navigation bar, teclado virtual e safe areas.

---

## 2. Problema Visual Já Observado no Android

Existe uma captura real do app instalado em Android mostrando problemas graves:

- o app aparece como se fosse um “phone frame dentro do celular”, centralizado e pequeno demais;
- existe muito espaço preto fora da UI;
- a status bar do Android aparece no topo e o app ainda renderiza uma status bar fake interna com horário duplicado;
- a interface não parece estar usando a área total disponível;
- a keyboard row e a bottom bar ficam presas em uma moldura interna, não no layout Android real;
- a UI parece dimensionada para preview desktop e não adaptada ao WebView mobile real.

Trate isso como bug crítico de Android, não como detalhe estético.

---

## 3. Como Você Deve Analisar

Abra e leia o projeto inteiro, com foco especial em:

```text
src/App.tsx
src/styles/globals.css
src/styles/editor.css
src/components/StatusBar/
src/components/Editor/
src/components/KeyboardRow/
src/components/Workbench/
src/components/FileTree/
src/components/Problems/
src/store/
src/hooks/
src-tauri/tauri.conf.json
src-tauri/capabilities/
src-tauri/src/
src-tauri/icons/
.github/workflows/
package.json
README.md
```

Procure problemas em:

- layout Android real;
- responsividade;
- safe area;
- teclado virtual;
- status bar / navigation bar;
- WebView Android;
- permissões Tauri;
- filesystem mobile;
- assinatura e release APK;
- nome/ícone/app label;
- performance;
- acessibilidade touch;
- CodeMirror no mobile;
- diagnóstico/language services;
- estado global;
- bugs de UX;
- bugs de arquitetura;
- coisas faltando para um MVP Android instalável e usável.

---

## 4. Formato Obrigatório do Relatório

Crie o arquivo `AUDITORIA_ANDROID_LYNX_STUDIO_RELATORIO.md` com esta estrutura:

```md
# Auditoria Android — Lynx Studio

## Resumo Executivo
Explique em poucas linhas se o app está pronto ou não para Android real.

## Bugs Críticos
### 1. Título do problema
- Prioridade: P0/P1/P2/P3
- Arquivos afetados:
- Como reproduzir:
- Causa provável:
- Impacto no Android:
- Correção recomendada:
- Patch sugerido, se possível:

## Problemas de Layout Android
...

## Problemas de Teclado Virtual e Safe Area
...

## Problemas de Tauri/Android Nativo
...

## Problemas de File System e Permissões
...

## Problemas do Editor/CodeMirror
...

## Problemas de Diagnósticos
...

## Problemas de Performance
...

## Problemas de UX Mobile
...

## O Que Está Faltando Para Ser Um App Android Bom
...

## Roadmap de Correção
### Fase 1 — Fazer instalar e ocupar a tela corretamente
### Fase 2 — Tornar edição mobile confortável
### Fase 3 — File system Android real
### Fase 4 — Recursos avançados

## Checklist Final Para Implementação
- [ ] ...
```

Use essa estrutura mesmo que algum item pareça repetido. O objetivo é facilitar a implementação depois.

---

## 5. Pontos Que Você DEVE Verificar

### 5.1 Android Fullscreen / Tela Útil

Verifique se existe CSS ou layout prendendo o app em tamanho fixo de desktop, por exemplo:

- `width: 390px`;
- `height: 844px`;
- `max-width`;
- wrappers centralizados;
- `body`/`#root` com tamanho errado;
- phone frame sendo aplicado no Android;
- `overflow` que corta a tela;
- `100vh` causando bug com teclado / barras Android;
- falta de `height: 100dvh`;
- falta de `env(safe-area-inset-*)`;
- status bar fake renderizada dentro do Android.

O app no Android deve usar a tela inteira disponível. O modo “phone frame” deve ser apenas desktop/dev.

### 5.2 Status Bar e Navigation Bar

Verifique:

- se a TopStatusBar fake deve sumir no Android;
- se precisa usar plugin/API para status bar nativa;
- se o app deve usar edge-to-edge ou respeitar safe area;
- se a navigation bar inferior está encobrindo conteúdo;
- se a bottom status bar e keyboard row ficam acima da navigation bar.

### 5.3 Teclado Virtual

Verifique:

- uso de `visualViewport`;
- se `--keyboard-height` funciona no Android WebView;
- se a KeyboardRow fica acima do teclado real;
- se o editor perde altura corretamente quando o teclado abre;
- se há scroll preso ou conteúdo escondido;
- se `CodeMirror` mantém cursor visível ao digitar;
- se a toolbar inferior não fica atrás da navigation bar.

### 5.4 CodeMirror Mobile

Verifique:

- seleção por toque;
- cursor e scroll;
- pinch zoom/fonte;
- line wrapping;
- gutters estreitas demais;
- fonte/tamanho real no Android;
- performance com arquivos grandes;
- autocorrect/autocapitalize/spellcheck em inputs/editor;
- gestos conflitantes com drawer/activity bar.

### 5.5 Diagnósticos

Verifique se o sistema de diagnósticos está gerando falsos positivos. No print, JSX/TSX aparentemente recebe vários squiggles vermelhos em trechos que podem ser válidos. Audite:

- `src/diagnostics/`;
- integração com `@codemirror/lint`;
- workers/language services;
- detecção de TSX/JSX;
- conversão de offsets para linha/coluna;
- lint local regex simples marcando JSX como erro;
- atualização dos diagnósticos por arquivo;
- performance do lint em mobile;
- painel de problemas;
- tooltip em toque, não hover.

### 5.6 File System Android

Verifique:

- se o app abre arquivos reais no Android ou só sample project;
- se usa corretamente `@tauri-apps/plugin-fs`;
- se precisa de file picker / SAF (Storage Access Framework);
- se permissões em `capabilities/` são suficientes;
- se `fs:read-all`/`write-all` fazem sentido no Android;
- como salvar/autosave em documentos fora do sandbox;
- UX de abrir projeto/pasta no Android;
- tratamento de erro quando permissão é negada.

### 5.7 Tauri Android

Verifique:

- `src-tauri/tauri.conf.json`;
- identifier/package name;
- productName/app label;
- ícones adaptativos Android;
- permissões nativas;
- configuração de orientation;
- splash screen;
- hardware back button;
- deep link/file open;
- lifecycle pause/resume;
- WebView debugging;
- build release assinado;
- workflow GitHub Actions;
- APK/AAB para loja.

### 5.8 UX Mobile

Verifique:

- botões pequenos demais para toque;
- barras muito lotadas;
- ActivityBar ocupando largura excessiva;
- drawer abrindo/fechando;
- command palette em tela pequena;
- settings;
- terminal;
- AI sidebar;
- empty states;
- feedback visual;
- acessibilidade;
- contraste;
- textos em português;
- estados de loading/erro.

### 5.9 Performance

Verifique:

- bundle grande;
- language workers pesados;
- `isomorphic-git` no bundle inicial;
- lazy loading;
- chunk splitting;
- custo de linters;
- memória no Android mid-range;
- renderizações Zustand/React;
- CodeMirror extensions recriadas sem necessidade.

---

## 6. O Que O Relatório Deve Conter Além de Bugs

Inclua uma lista clara de “faltando implementar”, separada por prioridade:

### Obrigatório para MVP Android

Liste tudo que impede o app de ser bom no Android real.

### Importante depois do MVP

Liste melhorias que deixam o produto mais profissional.

### Futuro / não bloquear agora

Liste coisas avançadas que podem esperar.

---

## 7. Nível de Detalhe Esperado

Não responda com generalidades como:

> “Melhorar responsividade”

Responda assim:

> “Em `src/App.tsx`, o container principal usa X/Y que causa letterboxing no Android. Trocar para `min-height: 100dvh`, remover frame fixo em mobile e aplicar `padding-top: env(safe-area-inset-top)` quando a status bar fake for removida.”

Sempre que possível, inclua:

- arquivo exato;
- trecho provável;
- motivo técnico;
- patch sugerido;
- teste manual para confirmar;
- risco de regressão.

---

## 8. Resultado Final Esperado

No final, entregue apenas o Markdown de auditoria. Ele deve ser completo o bastante para outro agente implementar as correções sem precisar adivinhar.

O tom pode ser direto. O app ainda está em construção e pode estar bastante quebrado no Android; a prioridade é encontrar tudo e organizar em uma fila de implementação real.
