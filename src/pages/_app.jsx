import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Primary Meta */}
        <title>TypeForge — Free Typing Speed Test & WPM Practice</title>
        <meta name="description" content="Free online typing speed test and WPM practice. Improve typing speed with structured lessons, character drills, speed tests, and typing games. No sign-up needed." />
        <meta name="keywords" content="typing speed test, wpm test, typing practice, free typing test, online typing test, typing speed, words per minute, touch typing, typing lessons, keyboard practice" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="TypeForge" />
        <link rel="canonical" href="https://typeforge.site" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://typeforge.site" />
        <meta property="og:title" content="TypeForge — Free Typing Speed Test & WPM Practice" />
        <meta property="og:description" content="Improve your typing speed with adaptive lessons, character drills, timed speed tests and typing games. Free, no sign-up required." />
        <meta property="og:site_name" content="TypeForge" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TypeForge — Free Typing Speed Test & WPM Practice" />
        <meta name="twitter:description" content="Improve your typing speed with adaptive lessons, character drills, timed speed tests and typing games." />

        {/* Performance: preconnect first, then preload font CSS */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Load font async — non-blocking */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          media="print"
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          />
        </noscript>

        

        {/* Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "TypeForge",
              "url": "https://typeforge.site",
              "description": "Free online typing speed test and WPM practice platform with adaptive lessons, character drills, speed tests, and typing games.",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Typing Speed Test",
                "WPM Test",
                "Character Drill",
                "Typing Lessons",
                "Typing Games",
                "Leaderboard"
              ]
            })
          }}
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
