"use client";

import { APP_NAME } from '@/lib/constants';
import { useState, useEffect } from 'react';

export function AppFooter() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        {currentYear !== null ? (
          <p>&copy; {currentYear} {APP_NAME}. All rights reserved.</p>
        ) : (
          <p>Loading copyright year...</p>
        )}
        <p className="mt-1">
          Crafted with <span role="img" aria-label="love">❤️</span> for language learners.
        </p>
      </div>
    </footer>
  );
}
