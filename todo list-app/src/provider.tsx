import * as React from "react";
import { HeroUIProvider } from "@heroui/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "@/contexts/AuthContext";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <AuthProvider>{children}</AuthProvider>
      <ToastContainer autoClose={3000} position="bottom-right" />
    </HeroUIProvider>
  );
}
