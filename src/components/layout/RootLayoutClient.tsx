
'use client';

import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";

export default function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {children}
      {isClient && <Toaster />}
    </>
  );
}
