// pages/_app.tsx
import type { AppProps } from 'next/app';
import { FavoritesProvider } from '../../context/FavoritesContext';
import '../styles/globals.css'; // if you have global styles

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FavoritesProvider>
      <Component {...pageProps} />
    </FavoritesProvider>
  );
}