import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { useEditorStore } from '../../store/editorStore';
import { usePlatform } from '../../hooks/usePlatform';

export function MiniTerminal() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const isOpen = useEditorStore((state) => state.isTerminalOpen);
  const toggleTerminal = useEditorStore((state) => state.toggleTerminal);
  const { isMobile } = usePlatform();

  useEffect(() => {
    const host = hostRef.current;

    if (!host || terminalRef.current) {
      return undefined;
    }

    const terminal = new Terminal({
      cursorBlink: true,
      rows: isMobile ? 5 : 8,
      fontSize: 11,
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
      theme: {
        background: '#111111',
        foreground: '#d4d4d4',
        cursor: '#007acc',
      },
    });
    terminal.open(host);
    terminal.writeln('\x1b[1;36mLynx Studio\x1b[0m - Terminal');
    terminal.writeln('\x1b[90mPronto. Comandos Tauri disponíveis.\x1b[0m');
    terminal.write('$ ');
    terminal.onData((data) => {
      if (data === '\r') {
        terminal.write('\r\n$ ');
        return;
      }

      terminal.write(data);
    });
    terminalRef.current = terminal;

    return () => {
      terminal.dispose();
      terminalRef.current = null;
    };
  }, [isMobile]);

  if (isMobile) {
    return null;
  }

  return (
    <section
      className={clsx(
        'absolute inset-x-0 bottom-0 z-30 h-48 max-h-[42%] border-t border-codex-border bg-[#111111] transition-all duration-200',
        isOpen
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-full opacity-0',
      )}
      aria-hidden={!isOpen}
    >
      <div className="flex h-8 items-center justify-between border-b border-codex-border px-2 font-sans text-xs text-codex-text">
        <span>Terminal</span>
        <button
          type="button"
          className="grid h-6 w-6 place-items-center rounded-[4px] text-codex-muted active:bg-codex-hover active:text-white"
          onClick={() => toggleTerminal(false)}
          aria-label="Fechar terminal"
        >
          <X size={13} />
        </button>
      </div>
      <div ref={hostRef} className="h-[calc(100%-32px)] px-1" />
    </section>
  );
}
