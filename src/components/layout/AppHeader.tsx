
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
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
import { NAV_LINKS_USER } from "@/lib/constants";
import type { Language, LearningMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { useLearning } from "@/context/LearningContext";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import type { ProfileData } from "@/app/profile/page";


export function AppHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { 
    selectedLanguage, 
    selectedMode, 
    setLanguage, 
    setMode, 
    isLoadingPreferences, 
    authUser 
  } = useLearning();
  const { toggleSidebar, isMobile } = useSidebar();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setEffectiveTheme(isDark ? 'dark' : 'light');

    const observer = new MutationObserver(() => {
      const currentlyDark = document.documentElement.classList.contains('dark');
      setEffectiveTheme(currentlyDark ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (authUser) {
        setUserEmail(authUser.email || "");
        const db = getFirestore(app);
        const userDocRef = doc(db, "users", authUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data() as ProfileData;
            setUserName(userData.displayName || authUser.displayName || authUser.email?.split('@')[0] || "User");
          } else {
            setUserName(authUser.displayName || authUser.email?.split('@')[0] || "User");
          }
        } catch (error) {
          console.error("Error fetching user name for header:", error);
          setUserName(authUser.displayName || authUser.email?.split('@')[0] || "User");
        }
      } else {
        setUserName("User");
        setUserEmail("");
      }
    };
    fetchUserDetails();
  }, [authUser]);


  const handleLanguageChange = async (newLanguage: Language) => {
    await setLanguage(newLanguage);
  };

  const handleModeChange = async (newMode: LearningMode) => {
    await setMode(newMode);
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

  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      // The onAuthStateChanged listener in LearningContext will handle resetting state.
      // Router push to login can be added here if not handled globally
      // For example: router.push('/login'); 
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to log out.");
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
          {!isMobile && (
            <div className="flex items-center gap-2">
              <LanguageSelector 
                selectedLanguage={selectedLanguage} 
                onLanguageChange={handleLanguageChange} 
                disabled={isLoadingPreferences} 
              />
              <ModeSelector 
                selectedMode={selectedMode} 
                onModeChange={handleModeChange} 
                disabled={isLoadingPreferences} 
              />
            </div>
          )}

          {mounted ? (
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {effectiveTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          ) : (
            <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
              <Moon className="h-5 w-5" />
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
                <p className="font-medium">{userName}</p>
                {userEmail && <p className="text-xs text-muted-foreground">{userEmail}</p>}
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
              <DropdownMenuItem 
                className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                onSelect={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {mounted && isMobile && (
             <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open settings">
                    <Settings className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] z-[1001]"> {/* Ensure sheet content is above other elements */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-medium">Session Settings</h3>
                    <LanguageSelector 
                      selectedLanguage={selectedLanguage} 
                      onLanguageChange={handleLanguageChange} 
                      className="w-full" 
                      disabled={isLoadingPreferences} 
                    />
                    <ModeSelector 
                      selectedMode={selectedMode} 
                      onModeChange={handleModeChange} 
                      className="w-full" 
                      disabled={isLoadingPreferences}
                    />
                     {isLoadingPreferences && <p className="text-sm text-muted-foreground text-center">Loading preferences...</p>}
                  </div>
                </SheetContent>
              </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
