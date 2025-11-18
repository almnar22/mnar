export interface ThemeColors {
  '--color-primary': string;
  '--color-primary-hover': string;
  '--color-primary-light': string;
  '--color-primary-text': string;
  '--color-secondary': string;
  '--color-secondary-hover': string;
  '--color-secondary-light': string;
  '--color-background': string;
  '--color-card': string;
  '--color-text-base': string;
  '--color-text-muted': string;
  '--color-border': string;
  '--color-success': string;
  '--color-success-light': string;
  '--color-success-text': string;
  '--color-warning': string;
  '--color-warning-light': string;
  '--color-warning-text': string;
}

export type ThemeName = 'default' | 'dark' | 'green' | 'purple';

export interface Theme {
  name: ThemeName;
  label: string;
  icon: string;
  colors: ThemeColors;
}

export const themes: Record<ThemeName, Theme> = {
  default: {
    name: 'default',
    label: 'السمة الافتراضية',
    icon: '🔷🔶',
    colors: {
      '--color-primary': '#1e40af', // blue-800
      '--color-primary-hover': '#1e3a8a', // blue-900
      '--color-primary-light': '#dbeafe', // blue-100
      '--color-primary-text': '#ffffff',
      '--color-secondary': '#ea580c', // orange-600
      '--color-secondary-hover': '#c2410c', // orange-700
      '--color-secondary-light': '#ffedd5', // orange-100
      '--color-background': '#f1f5f9', // slate-100
      '--color-card': '#ffffff',
      '--color-text-base': '#1e293b', // slate-800
      '--color-text-muted': '#475569', // slate-600
      '--color-border': '#e2e8f0', // slate-300
      '--color-success': '#16a34a', // green-600
      '--color-success-light': '#dcfce7', // green-100
      '--color-success-text': '#166534', // green-800
      '--color-warning': '#f59e0b', // amber-500
      '--color-warning-light': '#fef3c7', // amber-100
      '--color-warning-text': '#b45309', // amber-700
    }
  },
  dark: {
    name: 'dark',
    label: 'السمة الداكنة',
    icon: '⚫⚪',
    colors: {
      '--color-primary': '#60a5fa', // blue-400
      '--color-primary-hover': '#3b82f6', // blue-500
      '--color-primary-light': '#374151', // gray-700
      '--color-primary-text': '#000000',
      '--color-secondary': '#f97316', // orange-500
      '--color-secondary-hover': '#ea580c', // orange-600
      '--color-secondary-light': '#4b5563', // gray-600
      '--color-background': '#111827', // gray-900
      '--color-card': '#1f2937', // gray-800
      '--color-text-base': '#e5e7eb', // gray-200
      '--color-text-muted': '#9ca3af', // gray-400
      '--color-border': '#4b5563', // gray-600
      '--color-success': '#22c55e',
      '--color-success-light': '#374151',
      '--color-success-text': '#86efac',
      '--color-warning': '#f59e0b',
      '--color-warning-light': '#374151',
      '--color-warning-text': '#fcd34d',
    }
  },
  green: {
    name: 'green',
    label: 'السمة الخضراء',
    icon: '💚🌿',
    colors: {
      '--color-primary': '#166534', // green-800
      '--color-primary-hover': '#14532d', // green-900
      '--color-primary-light': '#dcfce7', // green-100
      '--color-primary-text': '#ffffff',
      '--color-secondary': '#ca8a04', // yellow-600
      '--color-secondary-hover': '#a16207', // yellow-700
      '--color-secondary-light': '#fef9c3', // yellow-100
      '--color-background': '#f0fdf4', // green-50
      '--color-card': '#ffffff',
      '--color-text-base': '#14532d', // green-900
      '--color-text-muted': '#3f6212', // lime-800
      '--color-border': '#dcfce7', // green-100
      '--color-success': '#16a34a',
      '--color-success-light': '#dcfce7',
      '--color-success-text': '#166534',
      '--color-warning': '#f59e0b',
      '--color-warning-light': '#fef3c7',
      '--color-warning-text': '#b45309',
    }
  },
  purple: {
    name: 'purple',
    label: 'السمة البنفسجية',
    icon: '💜🌸',
    colors: {
      '--color-primary': '#6b21a8', // purple-800
      '--color-primary-hover': '#581c87', // purple-900
      '--color-primary-light': '#f3e8ff', // purple-100
      '--color-primary-text': '#ffffff',
      '--color-secondary': '#db2777', // pink-600
      '--color-secondary-hover': '#be185d', // pink-700
      '--color-secondary-light': '#fce7f3', // pink-100
      '--color-background': '#faf5ff', // purple-50
      '--color-card': '#ffffff',
      '--color-text-base': '#4a044e', // purple-950
      '--color-text-muted': '#86198f', // fuchsia-800
      '--color-border': '#f3e8ff', // purple-100
      '--color-success': '#16a34a',
      '--color-success-light': '#dcfce7',
      '--color-success-text': '#166534',
      '--color-warning': '#f59e0b',
      '--color-warning-light': '#fef3c7',
      '--color-warning-text': '#b45309',
    }
  }
};
