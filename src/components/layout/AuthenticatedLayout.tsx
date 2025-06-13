"use client";

import React from 'react';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { AppFooter } from './AppFooter';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </div>
        <AppFooter />
      </div>
    </SidebarProvider>
  );
}
