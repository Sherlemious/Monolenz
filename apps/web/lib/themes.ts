/**
 * Public profile theme definitions.
 * CSS variable overrides are applied as inline styles on the public profile page root element,
 * isolating the theme from the app UI.
 */

export interface ThemeDefinition {
  id: string;
  label: string;
  /** Preview colors shown in the theme selector swatch */
  preview: { bg: string; accent: string; text: string };
  /** CSS custom property overrides (applied inline on the profile root wrapper) */
  cssVars: Record<string, string>;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'default',
    label: 'Default',
    preview: { bg: '#ffffff', accent: '#1a1a1a', text: '#1a1a1a' },
    cssVars: {},
  },
  {
    id: 'midnight',
    label: 'Midnight',
    preview: { bg: '#0f172a', accent: '#3b82f6', text: '#f8fafc' },
    cssVars: {
      '--background': 'oklch(0.13 0.04 264)',
      '--foreground': 'oklch(0.97 0 0)',
      '--card': 'oklch(0.18 0.04 264)',
      '--card-foreground': 'oklch(0.97 0 0)',
      '--primary': 'oklch(0.6 0.2 264)',
      '--primary-foreground': 'oklch(0.98 0 0)',
      '--muted': 'oklch(0.22 0.03 264)',
      '--muted-foreground': 'oklch(0.65 0.04 264)',
      '--border': 'oklch(0.3 0.04 264)',
      '--accent': 'oklch(0.22 0.03 264)',
      '--accent-foreground': 'oklch(0.97 0 0)',
    },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    preview: { bg: '#f0f9ff', accent: '#0284c7', text: '#0c4a6e' },
    cssVars: {
      '--background': 'oklch(0.97 0.02 210)',
      '--foreground': 'oklch(0.2 0.08 210)',
      '--card': 'oklch(1 0 0)',
      '--card-foreground': 'oklch(0.2 0.08 210)',
      '--primary': 'oklch(0.5 0.2 210)',
      '--primary-foreground': 'oklch(0.98 0 0)',
      '--muted': 'oklch(0.92 0.03 210)',
      '--muted-foreground': 'oklch(0.5 0.08 210)',
      '--border': 'oklch(0.85 0.04 210)',
      '--accent': 'oklch(0.92 0.03 210)',
      '--accent-foreground': 'oklch(0.2 0.08 210)',
    },
  },
  {
    id: 'forest',
    label: 'Forest',
    preview: { bg: '#f0fdf4', accent: '#16a34a', text: '#14532d' },
    cssVars: {
      '--background': 'oklch(0.97 0.02 145)',
      '--foreground': 'oklch(0.2 0.08 145)',
      '--card': 'oklch(1 0 0)',
      '--card-foreground': 'oklch(0.2 0.08 145)',
      '--primary': 'oklch(0.5 0.18 145)',
      '--primary-foreground': 'oklch(0.98 0 0)',
      '--muted': 'oklch(0.92 0.03 145)',
      '--muted-foreground': 'oklch(0.5 0.07 145)',
      '--border': 'oklch(0.85 0.04 145)',
      '--accent': 'oklch(0.92 0.03 145)',
      '--accent-foreground': 'oklch(0.2 0.08 145)',
    },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    preview: { bg: '#fff7ed', accent: '#ea580c', text: '#7c2d12' },
    cssVars: {
      '--background': 'oklch(0.98 0.02 55)',
      '--foreground': 'oklch(0.25 0.08 40)',
      '--card': 'oklch(1 0 0)',
      '--card-foreground': 'oklch(0.25 0.08 40)',
      '--primary': 'oklch(0.6 0.22 40)',
      '--primary-foreground': 'oklch(0.98 0 0)',
      '--muted': 'oklch(0.94 0.03 55)',
      '--muted-foreground': 'oklch(0.55 0.07 45)',
      '--border': 'oklch(0.87 0.04 55)',
      '--accent': 'oklch(0.94 0.03 55)',
      '--accent-foreground': 'oklch(0.25 0.08 40)',
    },
  },
];

export function getTheme(id: string | null | undefined): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]!;
}
