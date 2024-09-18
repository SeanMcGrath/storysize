"use client";

import { useEffect } from "react";
import { useAdsEnabled } from "../hooks/useAdsEnabled";

declare global {
  // This is injected by the AdSenseScript component in the root layout
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdBanner({ adSlot }: { adSlot: string }) {
  const adsEnabled = useAdsEnabled();

  useEffect(() => {
    if (adsEnabled) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [adsEnabled]);

  if (!adsEnabled) return null;

  return (
    <div className="my-4 flex justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
