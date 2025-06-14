
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LEARNING_MODES, DEFAULT_MODE } from "@/lib/constants";
import type { LearningMode } from "@/lib/types";

interface ModeSelectorProps {
  selectedMode: LearningMode;
  onModeChange: (mode: LearningMode) => void;
  className?: string;
}

export function ModeSelector({ selectedMode, onModeChange, className }: ModeSelectorProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
          aria-label={`Select learning mode, current: ${selectedMode.name}`}
        >
          <span className="truncate">{selectedMode.name}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 z-[1000]">
        <Command>
          <CommandInput placeholder="Search mode..." />
          <CommandList>
            <CommandEmpty>No mode found.</CommandEmpty>
            <CommandGroup>
              {LEARNING_MODES.map((mode) => (
                <CommandItem
                  key={mode.id}
                  value={mode.name}
                  onSelect={() => {
                    onModeChange(mode);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedMode.id === mode.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {mode.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
