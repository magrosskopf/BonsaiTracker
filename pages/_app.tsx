import { SessionProvider } from "next-auth/react";
// ...existing code...

export default function App({ Component, pageProps }: any) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
