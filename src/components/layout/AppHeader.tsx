
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
import { NAV_LINKS_USER, DEFAULT_LANGUAGE, DEFAULT_MODE } from "@/lib/constants";
import type { Language, LearningMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar"; 

export function AppHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [currentMode, setCurrentMode] = useState<LearningMode>(DEFAULT_MODE);
  const { toggleSidebar, isMobile } = useSidebar(); 

  // State for theme, to be updated after mount
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light'); // Default to light for server/initial client

  useEffect(() => {
    setMounted(true);
    // Determine and set initial theme after mount
    const isDark = document.documentElement.classList.contains('dark');
    setEffectiveTheme(isDark ? 'dark' : 'light');

    // Optional: Listen to changes on documentElement if theme can be changed by other means
    // For instance, if a global theme switcher modifies the class directly.
    const observer = new MutationObserver(() => {
      const currentlyDark = document.documentElement.classList.contains('dark');
      setEffectiveTheme(currentlyDark ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);


  const handleLanguageChange = (newLanguage: Language) => {
    setCurrentLanguage(newLanguage);
    // In a real app, you might save this preference.
    console.log("Language changed to:", newLanguage.name);
  };

  const handleModeChange = (newMode: LearningMode) => {
    setCurrentMode(newMode);
    // In a real app, you might save this preference.
    console.log("Mode changed to:", newMode.name);
  };
  
  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    if (isCurrentlyDark) {
      document.documentElement.classList.remove('dark');
      setEffectiveTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      setEffectiveTheme('dark');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {mounted && isMobile && ( 
            <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <Logo iconSize={24} textSize="text-xl" />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <LanguageSelector selectedLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />
            <ModeSelector selectedMode={currentMode} onModeChange={handleModeChange} />
          </div>

          {/* Theme Toggle Button */}
          {mounted ? (
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {effectiveTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          ) : (
            // Render a placeholder or disabled button server-side and on initial client render
            <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
              <Moon className="h-5 w-5" /> {/* Matches initial effectiveTheme state ('light') */}
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
                <p className="font-medium">User Name</p> {/* Placeholder */}
                <p className="text-xs text-muted-foreground">user@example.com</p> {/* Placeholder */}
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
              {/* Placeholder Logout functionality */}
              <DropdownMenuItem 
                className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                onSelect={() => alert("Logout functionality to be implemented")}
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile selectors */}
          {mounted && isMobile && (
             <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open settings">
                    <Settings className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] z-[70]"> {/* Increased z-index for sheet content */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-medium">Settings</h3>
                    <LanguageSelector selectedLanguage={currentLanguage} onLanguageChange={handleLanguageChange} className="w-full" />
                    <ModeSelector selectedMode={currentMode} onModeChange={handleModeChange} className="w-full" />
                  </div>
                </SheetContent>
              </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
