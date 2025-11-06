export const COLORS = {
  primary: '#008CBA',   // azul principal
  accent: '#F7931E',    // laranja
  green: '#4CAF50',     // verde do logo
  
  white: '#FFFFFF',
  black: '#000000',
  text: '#333333',      //cinza escuro para textos
  lightGray: '#F5F5F5', //cinza claro para a tela
  gray: '#CCCCCC',
};

export const SIZES = {
  base: 8,
  padding: 16,
  radius: 8,

  h1: 24,
  h2: 20,
  h3: 18,
  body: 14,
};

export const FONTS = {
  h2: { fontSize: SIZES.h2, fontWeight: 'bold' },
  h3: { fontSize: SIZES.h3, fontWeight: 'bold' },
  body: { fontSize: SIZES.body, lineHeight: 22 },
};

const appTheme = { COLORS, SIZES, FONTS };

export default appTheme;