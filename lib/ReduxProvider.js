"use client";
import { makeStore } from "./store";
import { Provider } from "react-redux";
import React, { useRef, useEffect } from "react";

export default function ReduxProvider({ children }) {
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  useEffect(() => {
    // Rehydrate cart from localStorage on mount once
    storeRef.current.dispatch({ type: "cart/rehydrateCart" });
  }, []);
  return <Provider store={storeRef.current}>{children}</Provider>;
}
