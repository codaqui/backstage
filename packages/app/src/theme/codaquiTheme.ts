import {
  createUnifiedTheme,
  palettes,
} from '@backstage/theme';

// Cores da Codaqui
const codaquiGreen = '#57B593';
const codaquiDarkGray = '#3A2F39';
const codaquiLightGray = '#B5B5B5';

export const codaquiLightTheme = createUnifiedTheme({
  palette: {
    ...palettes.light,
    primary: {
      main: codaquiGreen,
      light: '#7fccb1',
      dark: '#3d8066',
      contrastText: '#ffffff',
    },
    secondary: {
      main: codaquiDarkGray,
      light: '#5a4f59',
      dark: '#2a2129',
      contrastText: '#ffffff',
    },
    navigation: {
      background: codaquiDarkGray,
      indicator: codaquiGreen,
      color: '#ffffff',
      selectedColor: codaquiGreen,
    },
  },
  defaultPageTheme: 'home',
  fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
  components: {
    BackstageHeader: {
      styleOverrides: {
        header: {
          backgroundImage: 'unset',
          backgroundColor: codaquiDarkGray,
        },
      },
    },
  },
});

export const codaquiDarkTheme = createUnifiedTheme({
  palette: {
    ...palettes.dark,
    primary: {
      main: codaquiGreen,
      light: '#7fccb1',
      dark: '#3d8066',
      contrastText: '#ffffff',
    },
    secondary: {
      main: codaquiLightGray,
      light: '#d4d4d4',
      dark: '#8c8c8c',
      contrastText: '#000000',
    },
    navigation: {
      background: '#1a1a1a',
      indicator: codaquiGreen,
      color: '#ffffff',
      selectedColor: codaquiGreen,
    },
  },
  defaultPageTheme: 'home',
  fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
  components: {
    BackstageHeader: {
      styleOverrides: {
        header: {
          backgroundImage: 'unset',
          backgroundColor: '#1a1a1a',
        },
      },
    },
  },
});
