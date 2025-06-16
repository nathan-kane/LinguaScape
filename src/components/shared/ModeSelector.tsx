
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
import { LEARNING_MODES } from "@/lib/constants";
import type { LearningMode } from "@/lib/types";

interface ModeSelectorProps {
  selectedMode: LearningMode;
  onModeChange: (mode: LearningMode) => void;
  className?: string;
  disabled?: boolean;
}

export function ModeSelector({ selectedMode, onModeChange, className, disabled }: ModeSelectorProps) {
  const handleValueChange = (value: string) => {
    const newMode = LEARNING_MODES.find(mode => mode.id === value);
    if (newMode) {
      onModeChange(newMode);
    }
  };

  return (
    <Select
      value={selectedMode.id}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger 
        className={cn("w-[200px] justify-between", className)}
        aria-label={`Select learning mode, current: ${selectedMode.name}`}
      >
        <SelectValue placeholder="Select mode">
          <span className="truncate">{selectedMode.name}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-[1000]"> {/* Maintain high z-index */}
        {LEARNING_MODES.map((mode) => (
          <SelectItem key={mode.id} value={mode.id}>
            {mode.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
