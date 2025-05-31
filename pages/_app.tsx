import { SessionProvider } from "next-auth/react";
import type { AppProps } from 'next/app';
import Navigation from '../components/Navigation';
import "../styles/globals.css";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Navigation />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
