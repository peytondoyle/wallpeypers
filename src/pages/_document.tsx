import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico?v=2" />
        <meta property="og:title" content="WALLPEYPERS" />
        <meta property="og:description" content="Download dreamy seasonal wallpapers 🌅" />
        <meta property="og:image" content="https://wallpeypers.vercel.app/WALLPEYPERS.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
