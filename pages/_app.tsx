import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Navigation from "../components/Navigation";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <div data-theme="bonsai" className="app-shell min-h-screen pb-24">
        <Component {...pageProps} />
        <Navigation />
      </div>
    </SessionProvider>
  );
}
