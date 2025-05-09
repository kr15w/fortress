"use client"

import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import NavigationButtons from "@/components/NavigateButtons";
import TopBar from "@/components/TopBar"; // Include TopBar

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TopBar /> {/* Ensure it's always present */}
      <NavigationButtons />
      {children}
    </ThemeProvider>
  );
}