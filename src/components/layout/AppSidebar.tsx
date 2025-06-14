
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { NAV_LINKS_MAIN, NAV_LINKS_USER, APP_NAME, APP_LOGO_ICON } from "@/lib/constants";
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


export function AppSidebar() {
  const pathname = usePathname();
  const { state: sidebarState, isMobile, setOpenMobile }  = useSidebar(); // Get sidebar state

  const isActive = (item: NavItem) => {
    if (item.matchStartsWith) {
      return pathname.startsWith(item.href);
    }
    return pathname === item.href;
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar side="left" variant="sidebar" collapsible={isMobile ? "offcanvas" : "icon"}>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Logo iconSize={sidebarState === 'collapsed' && !isMobile ? 28 : 24} showText={sidebarState === 'expanded' || isMobile} />
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
                    <span className={cn(sidebarState === 'collapsed' && !isMobile && "hidden")}>{item.label}</span>
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
            <Button variant="ghost" className={cn("w-full justify-start gap-2 px-2", sidebarState === 'collapsed' && !isMobile && "justify-center Aspect-square p-0")}>
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/100x100.png" alt="User avatar" data-ai-hint="user avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className={cn("flex flex-col items-start", sidebarState === 'collapsed' && !isMobile && "hidden")}>
                <span className="text-sm font-medium text-sidebar-foreground">User Name</span>
                <span className="text-xs text-sidebar-foreground/70">View Profile</span>
              </div>
            </Button>
          </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

