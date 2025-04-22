// DeckDojo Theme Configuration
// Colors extracted from the logo and design guidelines

const themeColors = {
  // Primary colors from logo
  mainBlue: '#11465d',    // Main color
  brightGold: '#fcdd5a',  // Accent color
  
  // Additional palette for pixel art dojo theme
  darkBlue: '#0a2c3d',
  lightBlue: '#2a7da1',
  veryLightBlue: '#5ab0d5',
  
  // Accent colors
  redAccent: '#ff5a5a',   // For life point reduction
  greenAccent: '#5aff8a', // For life point gain
  purpleAccent: '#9a5aff', // For special elements
  
  // Neutrals
  white: '#ffffff',
  offWhite: '#f8f8f8',
  lightGray: '#e0e0e0',
  mediumGray: '#a0a0a0',
  darkGray: '#505050',
  black: '#121212',
};

// Theme configurations
const lightTheme = {
  name: 'light',
  colors: {
    // Base colors
    primary: themeColors.mainBlue,
    secondary: themeColors.brightGold,
    background: themeColors.offWhite,
    surface: themeColors.white,
    
    // Text colors
    text: themeColors.darkBlue,
    textSecondary: themeColors.mainBlue,
    textOnPrimary: themeColors.white,
    textOnSecondary: themeColors.darkBlue,
    
    // UI elements
    accent: themeColors.redAccent,
    accentSecondary: themeColors.purpleAccent,
    border: themeColors.lightGray,
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // Buttons
    buttonPrimary: themeColors.mainBlue,
    buttonSecondary: themeColors.brightGold,
    buttonText: themeColors.white,
    buttonTextSecondary: themeColors.darkBlue,
    
    // Navigation
    navBackground: themeColors.mainBlue,
    navText: themeColors.brightGold,
    
    // Cards
    cardBackground: themeColors.white,
    cardBorder: themeColors.lightGray,
    
    // Status colors
    success: themeColors.greenAccent,
    error: themeColors.redAccent,
    warning: themeColors.brightGold,
    info: themeColors.lightBlue,
    
    // Pixel art specific
    pixelBorder: themeColors.mainBlue,
    pixelAccent: themeColors.brightGold,
    pixelHighlight: themeColors.veryLightBlue,
  },
  shadows: {
    small: '0 2px 4px rgba(17, 70, 93, 0.1)',
    medium: '0 4px 8px rgba(17, 70, 93, 0.12)',
    large: '0 8px 16px rgba(17, 70, 93, 0.14)',
    pixelSmall: '2px 2px 0 rgba(17, 70, 93, 0.5)',
    pixelMedium: '4px 4px 0 rgba(17, 70, 93, 0.5)',
    pixelLarge: '6px 6px 0 rgba(17, 70, 93, 0.5)',
  },
  typography: {
    fontFamily: "'Press Start 2P', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    headingFont: "'Press Start 2P', cursive",
    bodyFont: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem',
      xxxl: '3rem',
    },
    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    none: '0',
    small: '4px',
    medium: '8px',
    large: '12px',
    circle: '50%',
  },
  transitions: {
    short: '0.2s ease',
    medium: '0.3s ease',
    long: '0.5s ease',
  },
  pixelArt: {
    borderWidth: '4px',
    borderStyle: 'solid',
    pixelSize: '4px',
    gridSize: '8px',
  },
};

const darkTheme = {
  name: 'dark',
  colors: {
    // Base colors
    primary: themeColors.brightGold,
    secondary: themeColors.mainBlue,
    background: themeColors.darkBlue,
    surface: themeColors.mainBlue,
    
    // Text colors
    text: themeColors.white,
    textSecondary: themeColors.lightGray,
    textOnPrimary: themeColors.darkBlue,
    textOnSecondary: themeColors.white,
    
    // UI elements
    accent: themeColors.redAccent,
    accentSecondary: themeColors.purpleAccent,
    border: themeColors.mainBlue,
    shadow: 'rgba(0, 0, 0, 0.2)',
    
    // Buttons
    buttonPrimary: themeColors.brightGold,
    buttonSecondary: themeColors.lightBlue,
    buttonText: themeColors.darkBlue,
    buttonTextSecondary: themeColors.white,
    
    // Navigation
    navBackground: themeColors.darkBlue,
    navText: themeColors.brightGold,
    
    // Cards
    cardBackground: themeColors.mainBlue,
    cardBorder: themeColors.brightGold,
    
    // Status colors
    success: themeColors.greenAccent,
    error: themeColors.redAccent,
    warning: themeColors.brightGold,
    info: themeColors.veryLightBlue,
    
    // Pixel art specific
    pixelBorder: themeColors.brightGold,
    pixelAccent: themeColors.mainBlue,
    pixelHighlight: themeColors.veryLightBlue,
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.2)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.25)',
    large: '0 8px 16px rgba(0, 0, 0, 0.3)',
    pixelSmall: '2px 2px 0 rgba(252, 221, 90, 0.5)',
    pixelMedium: '4px 4px 0 rgba(252, 221, 90, 0.5)',
    pixelLarge: '6px 6px 0 rgba(252, 221, 90, 0.5)',
  },
  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  transitions: lightTheme.transitions,
  pixelArt: lightTheme.pixelArt,
};

export { lightTheme, darkTheme };
