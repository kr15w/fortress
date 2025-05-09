"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force theme application on mount
  React.useEffect(() => {
    const root = window.document.documentElement
    const initialTheme = localStorage.getItem(props.storageKey || "theme") || props.defaultTheme || "dark"

    // Remove any existing theme classes
    root.classList.remove("light", "dark")

    // Add the current theme class
    if (initialTheme === "dark") {
      root.classList.add("dark")
    } else if (initialTheme === "light") {
      root.classList.add("light")
    }

    // Also set a data attribute for additional styling hooks
    root.setAttribute("data-theme", initialTheme)
  }, [props.defaultTheme, props.storageKey])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
