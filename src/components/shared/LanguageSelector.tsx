
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import type { Language } from "@/lib/types";

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  className?: string;
}

export function LanguageSelector({ selectedLanguage, onLanguageChange, className }: LanguageSelectorProps) {
  const handleValueChange = (value: string) => {
    const newLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === value);
    if (newLanguage) {
      onLanguageChange(newLanguage);
    }
  };

  return (
    <Select
      value={selectedLanguage.code}
      onValueChange={handleValueChange}
    >
      <SelectTrigger 
        className={cn("w-[200px] justify-between", className)}
        aria-label={`Select language, current: ${selectedLanguage.name}`}
      >
        <SelectValue placeholder="Select language">
          <span className="truncate">
            {selectedLanguage.flag && <span className="mr-2">{selectedLanguage.flag}</span>}
            {selectedLanguage.name}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-[1000]"> {/* Maintain high z-index */}
        {SUPPORTED_LANGUAGES.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center">
              {language.flag && <span className="mr-2">{language.flag}</span>}
              {language.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
