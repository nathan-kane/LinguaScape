"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Sun, Moon, UserCircle, Settings, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/Logo";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { ModeSelector } from "@/components/shared/ModeSelector";
import { NAV_LINKS_MAIN, NAV_LINKS_USER, DEFAULT_LANGUAGE, DEFAULT_MODE, APP_NAME } from "@/lib/constants";
import type { Language, LearningMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar"; // Import useSidebar

export function AppHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  // TODO: Replace with actual state management for language and mode
  const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [currentMode, setCurrentMode] = useState<LearningMode>(DEFAULT_MODE);
  
  const { toggleSidebar, isMobile } = useSidebar(); // Get toggleSidebar and isMobile from context

  useEffect(() => setMounted(true), []);

  // Placeholder theme toggle function
  const toggleTheme = () => {
    // Actual theme toggling logic would go here
    console.log("Theme toggled");
  };
  
  const ThemeIcon = mounted && document.documentElement.classList.contains('dark') ? Sun : Moon;


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {isMobile && ( // Only show sidebar trigger on mobile
            <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <Logo iconSize={24} textSize="text-xl" />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <LanguageSelector selectedLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />
            <ModeSelector selectedMode={currentMode} onModeChange={setCurrentMode} />
          </div>

          {mounted && (
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              <ThemeIcon className="h-5 w-5" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-medium">User Name</p>
                <p className="text-xs text-muted-foreground">user@example.com</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {NAV_LINKS_USER.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile selectors */}
          {isMobile && (
             <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open settings">
                    <Settings className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-medium">Settings</h3>
                    <LanguageSelector selectedLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} className="w-full" />
                    <ModeSelector selectedMode={currentMode} onModeChange={setCurrentMode} className="w-full" />
                  </div>
                </SheetContent>
              </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
