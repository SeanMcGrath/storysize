"use client";

import Script from "next/script";

export default function AdSenseScript() {
  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        strategy="afterInteractive"
      />
      <Script id="google-adsense" strategy="afterInteractive">
        {`
          (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}",
            enable_page_level_ads: true
          });
        `}
      </Script>
    </>
  );
}
