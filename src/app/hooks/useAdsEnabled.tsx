import { useEffect, useState } from "react";

export function useAdsEnabled() {
  const [adsEnabled, setAdsEnabled] = useState(false);

  useEffect(() => {
    setAdsEnabled(!!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID);
  }, []);

  return adsEnabled;
}
