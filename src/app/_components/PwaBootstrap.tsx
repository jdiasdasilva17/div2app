"use client";

import { useEffect } from "react";

export function PwaBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silent on purpose: app should still function without push support.
    });
  }, []);

  return null;
}
