import { createTheme, ThemeOptions } from '@mui/material/styles';

// GitHub Color Palette
const githubColors = {
  // Light mode
  light: {
    bg: '#ffffff',
    bgSecondary: '#f6f8fa',
    bgTertiary: '#eaeef2',
    darkElements: '#0d1117',
    accent: '#0969da',
    accentMuted: '#0550ae',
    border: '#d0d7de',
    borderMuted: '#d8dee4',
    textPrimary: '#1f2328',
    textSecondary: '#656d76',
    textMuted: '#8b949e',
    success: '#1a7f37',
    successBg: '#dafbe1',
    warning: '#9a6700',
    warningBg: '#fff8c5',
    danger: '#cf222e',
    dangerBg: '#ffebe9',
    info: '#0969da',
    infoBg: '#ddf4ff',
  },
  // Dark mode
  dark: {
    bg: '#0d1117',
    bgSecondary: '#161b22',
    bgTertiary: '#21262d',
    darkElements: '#f0f6fc',
    accent: '#58a6ff',
    accentMuted: '#388bfd',
    border: '#30363d',
    borderMuted: '#21262d',
    textPrimary: '#f0f6fc',
    textSecondary: '#8b949e',
    textMuted: '#6e7681',
    success: '#3fb950',
    successBg: '#1f6feb26',
    warning: '#d29922',
    warningBg: '#d2992226',
    danger: '#f85149',
    dangerBg: '#f8514926',
    info: '#58a6ff',
    infoBg: '#388bfd26',
  },
};

// System font stack
const systemFontStack = `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif`;
// Code font stack
const monoFontStack = `"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace`;

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: githubColors.light.accent,
      light: githubColors.light.accentMuted,
    },
    secondary: {
      main: githubColors.light.textSecondary,
    },
    error: {
      main: githubColors.light.danger,
    },
    warning: {
      main: githubColors.light.warning,
    },
    success: {
      main: githubColors.light.success,
    },
    info: {
      main: githubColors.light.info,
    },
    background: {
      default: githubColors.light.bg,
      paper: githubColors.light.bg,
    },
    text: {
      primary: githubColors.light.textPrimary,
      secondary: githubColors.light.textSecondary,
    },
    divider: githubColors.light.border,
  } as ThemeOptions['palette'],
  typography: {
    fontFamily: systemFontStack,
    htmlFontSize: 14,
    fontSize: 14,
    fontWeightLight: 400,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    lineHeight: 1.5,
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h5: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    code: {
      fontFamily: monoFontStack,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#6e7781 #24292f',
          fontFamily: systemFontStack,
          fontSize: '1rem',
          lineHeight: 1.5,
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#6e7781',
            borderRadius: '4px',
          },
        },
        code: {
          fontFamily: monoFontStack,
          fontSize: '0.875rem',
        },
        pre: {
          fontFamily: monoFontStack,
          fontSize: '0.875rem',
        },
        ':root': {
          '--github-bg': '#ffffff',
          '--github-bg-secondary': '#f6f8fa',
          '--github-dark-elements': '#0d1117',
          '--github-accent': '#0969da',
          '--github-border': '#d0d7de',
          '--github-text-primary': '#1f2328',
          '--github-text-secondary': '#656d76',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '5px 16px',
          border: `1px solid ${githubColors.light.border}`,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: githubColors.light.accent,
          borderColor: githubColors.light.accent,
          '&:hover': {
            backgroundColor: githubColors.light.accentMuted,
            borderColor: githubColors.light.accentMuted,
          },
        },
        outlinedPrimary: {
          '&:hover': {
            backgroundColor: githubColors.light.accent + '15',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            backgroundColor: githubColors.light.bg,
            fontSize: '0.875rem',
            '& fieldset': {
              borderColor: githubColors.light.border,
            },
            '&:hover fieldset': {
              borderColor: githubColors.light.textMuted,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          border: `1px solid ${githubColors.light.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: `1px solid ${githubColors.light.border}`,
          backgroundColor: githubColors.light.bgSecondary,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${githubColors.light.border}`,
          backgroundColor: githubColors.light.bg,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: githubColors.light.border,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
          height: '24px',
        },
        outlined: {
          borderColor: githubColors.light.border,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&:hover': {
            backgroundColor: githubColors.light.bgSecondary,
          },
          '&.Mui-selected': {
            backgroundColor: githubColors.light.accent + '15',
            '&:hover': {
              backgroundColor: githubColors.light.accent + '20',
            },
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: githubColors.light.accent,
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
  },
} as ThemeOptions);

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: githubColors.dark.accent,
      light: githubColors.dark.accentMuted,
    },
    secondary: {
      main: githubColors.dark.textSecondary,
    },
    error: {
      main: githubColors.dark.danger,
    },
    warning: {
      main: githubColors.dark.warning,
    },
    success: {
      main: githubColors.dark.success,
    },
    info: {
      main: githubColors.dark.info,
    },
    background: {
      default: githubColors.dark.bg,
      paper: githubColors.dark.bg,
    },
    text: {
      primary: githubColors.dark.textPrimary,
      secondary: githubColors.dark.textSecondary,
    },
    divider: githubColors.dark.border,
  } as ThemeOptions['palette'],
  typography: {
    fontFamily: systemFontStack,
    htmlFontSize: 14,
    fontSize: 14,
    fontWeightLight: 400,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    lineHeight: 1.5,
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h5: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    code: {
      fontFamily: monoFontStack,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#484f58 #0d1117',
          fontFamily: systemFontStack,
          fontSize: '1rem',
          lineHeight: 1.5,
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#484f58',
            borderRadius: '4px',
          },
        },
        code: {
          fontFamily: monoFontStack,
          fontSize: '0.875rem',
        },
        pre: {
          fontFamily: monoFontStack,
          fontSize: '0.875rem',
        },
        ':root': {
          '--github-bg': '#0d1117',
          '--github-bg-secondary': '#161b22',
          '--github-dark-elements': '#f0f6fc',
          '--github-accent': '#58a6ff',
          '--github-border': '#30363d',
          '--github-text-primary': '#f0f6fc',
          '--github-text-secondary': '#8b949e',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '5px 16px',
          border: `1px solid ${githubColors.dark.border}`,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: githubColors.dark.accent,
          borderColor: githubColors.dark.accent,
          '&:hover': {
            backgroundColor: githubColors.dark.accentMuted,
            borderColor: githubColors.dark.accentMuted,
          },
        },
        outlinedPrimary: {
          '&:hover': {
            backgroundColor: githubColors.dark.accent + '20',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            backgroundColor: githubColors.dark.bgSecondary,
            fontSize: '0.875rem',
            '& fieldset': {
              borderColor: githubColors.dark.border,
            },
            '&:hover fieldset': {
              borderColor: githubColors.dark.textMuted,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          border: `1px solid ${githubColors.dark.border}`,
          boxShadow: 'none',
          backgroundColor: githubColors.dark.bg,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: `1px solid ${githubColors.dark.border}`,
          backgroundColor: githubColors.dark.bgSecondary,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${githubColors.dark.border}`,
          backgroundColor: githubColors.dark.bg,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: githubColors.dark.border,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
          height: '24px',
        },
        outlined: {
          borderColor: githubColors.dark.border,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&:hover': {
            backgroundColor: githubColors.dark.bgSecondary,
          },
          '&.Mui-selected': {
            backgroundColor: githubColors.dark.accent + '20',
            '&:hover': {
              backgroundColor: githubColors.dark.accent + '30',
            },
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: githubColors.dark.accent,
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
  },
} as ThemeOptions);

// Export color tokens for direct CSS usage
export const githubColorTokens = {
  light: githubColors.light,
  dark: githubColors.dark,
};

// Default export for backward compatibility
const theme = lightTheme;
export default theme;
