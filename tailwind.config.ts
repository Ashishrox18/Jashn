import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        ink: 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        primary: {
          DEFAULT: 'var(--primary)',
          ink: 'var(--primary-ink)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
        },
        ok: {
          DEFAULT: 'var(--ok)',
          soft: 'var(--ok-soft)',
        },
        warn: {
          DEFAULT: 'var(--warn)',
          soft: 'var(--warn-soft)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          soft: 'var(--danger-soft)',
        },
      },
      fontFamily: {
        heading: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
  plugins: [],
};

export default config;

