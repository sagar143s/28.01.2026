"use client";
import { useEffect } from "react";

export default function FbqPurchase() {
  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'Purchase');
    }
  }, []);
  return null;
}
