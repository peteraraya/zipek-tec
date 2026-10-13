"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";

export default function ConsentAwareAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const syncConsent = () => {
      setHasConsent(localStorage.getItem("cookie-consent") === "accepted");
    };
    syncConsent();
    window.addEventListener("zipek-cookie-consent-change", syncConsent);
    return () => window.removeEventListener("zipek-cookie-consent-change", syncConsent);
  }, []);

  return hasConsent ? <Analytics /> : null;
}
