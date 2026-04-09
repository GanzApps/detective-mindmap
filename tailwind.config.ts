import type { Config } from 'tailwindcss';

/**
 * Tailwind configuration aligned with the shell token system.
 *
 * Shell surfaces, text, border, accent, and destructive values are
 * expressed as CSS variable references so Tailwind utility classes
 * automatically reflect the active theme (light/dark via data-theme).
 *
 * Graph/entity semantic colors are intentionally absent here — they
 * belong to graph-specific stylesheets, not the shell token layer.
 */
const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        shell: {
          // Backgrounds
          bg:              'var(--shell-bg)',
          surface:         'var(--shell-surface)',
          'surface-raised':'var(--shell-surface-raised)',
          'surface-overlay':'var(--shell-surface-overlay)',

          // Text
          'text-primary':   'var(--shell-text-primary)',
          'text-secondary': 'var(--shell-text-secondary)',
          'text-muted':     'var(--shell-text-muted)',
          'text-inverse':   'var(--shell-text-inverse)',

          // Borders
          border:           'var(--shell-border)',
          'border-strong':  'var(--shell-border-strong)',
          'border-focus':   'var(--shell-border-focus)',

          // Accent
          accent:           'var(--shell-accent)',
          'accent-hover':   'var(--shell-accent-hover)',
          'accent-muted':   'var(--shell-accent-muted)',
          'accent-fg':      'var(--shell-accent-fg)',

          // Semantic
          destructive:      'var(--shell-destructive)',
          'destructive-bg': 'var(--shell-destructive-bg)',
        },
      },
      spacing: {
        'shell-xs':  'var(--shell-space-xs)',
        'shell-sm':  'var(--shell-space-sm)',
        'shell-md':  'var(--shell-space-md)',
        'shell-lg':  'var(--shell-space-lg)',
        'shell-xl':  'var(--shell-space-xl)',
        'shell-2xl': 'var(--shell-space-2xl)',
        'shell-3xl': 'var(--shell-space-3xl)',
      },
      borderRadius: {
        'shell-sm':   'var(--shell-radius-sm)',
        'shell-md':   'var(--shell-radius-md)',
        'shell-lg':   'var(--shell-radius-lg)',
        'shell-xl':   'var(--shell-radius-xl)',
        'shell-pill': 'var(--shell-radius-pill)',
      },
      boxShadow: {
        'shell-sm': 'var(--shell-shadow-sm)',
        'shell-md': 'var(--shell-shadow-md)',
        'shell-lg': 'var(--shell-shadow-lg)',
      },
      height: {
        'shell-header': 'var(--shell-header-h)',
        'shell-footer': 'var(--shell-footer-h)',
      },
      width: {
        'shell-sidebar': 'var(--shell-sidebar-w)',
      },
    },
  },
};

export default config;
