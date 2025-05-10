"use client"

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.add("light");
    }

    root.setAttribute("data-theme", theme || "dark");
  }, [theme]);

  return (
    <div className="fixed bottom-4 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="!bg-transparent !shadow-none !border-none !ring-0 hover:!bg-transparent focus:!bg-transparent active:!bg-transparent relative">
            {/* Sun icon (visible in light mode) */}
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all dark:opacity-0 opacity-100 text-[#434AB0]" />
            {/* Moon icon (visible in dark mode) */}
            <Moon className="absolute h-[1.2rem] w-[1.2rem] transition-all dark:opacity-100 opacity-0 text-[#434AB0]" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}