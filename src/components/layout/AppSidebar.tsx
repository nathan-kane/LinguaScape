
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { NAV_LINKS_MAIN, APP_NAME, APP_LOGO_ICON } from "@/lib/constants";
import type { NavItem } from "@/lib/types";
import { Logo } from "@/components/shared/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLearning } from "@/context/LearningContext";
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import type { ProfileData } from '@/app/profile/page';


export function AppSidebar() {
  const pathname = usePathname();
  const { state: sidebarState, isMobile, setOpenMobile, mounted: sidebarMounted }  = useSidebar(); 
  const { authUser, isLoadingPreferences } = useLearning();

  const [userName, setUserName] = useState("User");
  const [userAvatarUrl, setUserAvatarUrl] = useState("https://placehold.co/100x100.png");
  const [userAvatarFallback, setUserAvatarFallback] = useState("U");

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (authUser) {
        let name = authUser.displayName || authUser.email?.split('@')[0] || "User";
        let avatarUrl = authUser.photoURL || "https://placehold.co/100x100.png";
        
        const db = getFirestore(app);
        const userDocRef = doc(db, "users", authUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const firestoreData = docSnap.data() as ProfileData;
            name = firestoreData.displayName || name;
            avatarUrl = firestoreData.photoURL || avatarUrl;
          }
        } catch (error) {
          console.error("Error fetching user details for sidebar:", error);
        }
        
        setUserName(name);
        setUserAvatarUrl(avatarUrl);
        setUserAvatarFallback(name.charAt(0).toUpperCase() || "U");

      } else {
        // Reset if user logs out
        setUserName("User");
        setUserAvatarUrl("https://placehold.co/100x100.png");
        setUserAvatarFallback("U");
      }
    };

    if (!isLoadingPreferences) {
      fetchUserDetails();
    }
  }, [authUser, isLoadingPreferences]);


  const isActive = (item: NavItem) => {
    if (item.matchStartsWith) {
      return pathname.startsWith(item.href);
    }
    return pathname === item.href;
  };

  const handleLinkClick = () => {
    if (isMobile && sidebarMounted) { // Check mounted for isMobile
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar side="left" variant="sidebar" collapsible={isMobile && sidebarMounted ? "offcanvas" : "icon"}>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Logo iconSize={sidebarState === 'collapsed' && !isMobile && sidebarMounted ? 28 : 24} showText={sidebarState === 'expanded' || (isMobile && sidebarMounted)} />
      </SidebarHeader>

      <SidebarContent className="flex-1">
        <ScrollArea className="h-full py-2">
          <SidebarMenu className="px-2">
            {NAV_LINKS_MAIN.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} onClick={handleLinkClick}>
                  <SidebarMenuButton
                    isActive={isActive(item)}
                    tooltip={{ children: item.label, className: "font-body" }}
                    aria-label={item.label}
                    className="font-body"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className={cn(sidebarState === 'collapsed' && !isMobile && sidebarMounted && "hidden")}>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-3">
          <Link href="/profile" onClick={handleLinkClick}>
            <Button variant="ghost" className={cn("w-full justify-start gap-2 px-2", sidebarState === 'collapsed' && !isMobile && sidebarMounted && "justify-center Aspect-square p-0")}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatarUrl} alt={userName} data-ai-hint="user avatar" />
                <AvatarFallback>{userAvatarFallback}</AvatarFallback>
              </Avatar>
              <div className={cn("flex flex-col items-start", sidebarState === 'collapsed' && !isMobile && sidebarMounted && "hidden")}>
                <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[120px]">{userName}</span>
                <span className="text-xs text-sidebar-foreground/70">View Profile</span>
              </div>
            </Button>
          </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
