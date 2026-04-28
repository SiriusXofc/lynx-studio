/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        codex: {
          bg: '#1e1e1e',
          panel: '#252526',
          hover: '#2a2a2a',
          selected: '#094771',
          border: '#333333',
          accent: '#007acc',
          accentHover: '#1f8ad2',
          text: '#d4d4d4',
          muted: '#888888',
          line: '#282828',
          cyan: '#00c7e8',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        drawer: '18px 0 28px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};
