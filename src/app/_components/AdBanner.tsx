"use client";

import { useEffect, useRef } from "react";
import { useAdsEnabled } from "../hooks/useAdsEnabled";

declare global {
  // This is injected by the AdSenseScript component in the root layout
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdBanner({ adSlot }: { adSlot: string }) {
  const adsEnabled = useAdsEnabled();
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adsEnabled && adRef.current) {
      const observer = new ResizeObserver(() => {
        if (adRef.current && adRef.current.clientWidth > 0) {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (e) {
            console.error("AdSense error:", e);
          }
          observer.disconnect();
        }
      });

      observer.observe(adRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [adsEnabled]);

  if (!adsEnabled) return null;

  return (
    <div className="my-4 flex w-full justify-center" ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
