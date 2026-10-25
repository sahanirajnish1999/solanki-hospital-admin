"use client";

import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./store";
import { initializeAuth } from "./features/authSlice";
import { adminApi } from "./api/adminApi";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState(() => makeStore());

  useEffect(() => {
    // Hydrate authentication state from localStorage
    store.dispatch(initializeAuth());

    // If token exists, verify & fetch latest admin profile
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (token) {
        store.dispatch(adminApi.endpoints.getProfile.initiate());
      }
    }
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
