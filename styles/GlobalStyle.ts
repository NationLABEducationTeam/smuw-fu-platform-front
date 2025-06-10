import { createGlobalStyle } from "styled-components";
import GeistSansFont from '../app/fonts/GeistVF.woff';
import GeistMonoFont from '../app/fonts/GeistMonoVF.woff';

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Geist Sans';
    src: url(${GeistSansFont}) format('woff');
    font-weight: 100 900;
    font-style: normal;
  }

  @font-face {
    font-family: 'Geist Mono';
    src: url(${GeistMonoFont}) format('woff');
    font-weight: 100 900;
    font-style: normal;
  }
`;