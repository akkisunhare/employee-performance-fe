"use client";

import type React from "react";

import { X, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export type Option = {
  id: string;
  name: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: Option[];
  onChange: (selected: Option[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  emptyMessage = "No items found.",
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const handleSelect = (option: Option) => {
    if (disabled) return;
    const newSelected = [...selected, option];
    onChange(newSelected);
    
    // Close dropdown if all items are selected
    if (newSelected.length === options.length) {
      setOpen(false);
    }
  };

  const handleRemove = (e: MouseEvent, option: Option) => {
    if (disabled) return;
    e.stopPropagation();
    onChange(selected.filter((item) => item.id !== option.id));
  };

  // Filter out options that are already selected and match search query
  const availableOptions = options
    .filter((option) => !selected.some((item) => item.id === option.id))
    .filter((option) =>
      option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Reset search when closing dropdown
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <div
        role="combobox"
        aria-expanded={open}
        className={cn(
          "flex flex-wrap items-center gap-1 min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className
        )}
        onClick={() => !disabled && setOpen(!open)}
        tabIndex={disabled ? -1 : 0}
      >
        {selected.length > 0 ? (
          <>
            {selected.map((option) => (
              <Badge
                key={option.id}
                variant="secondary"
                className="flex items-center gap-1 py-1"
              >
                {option.name}
                {!disabled && (
                  <span
                    className="h-4 w-4 rounded-full p-0 flex items-center justify-center cursor-pointer hover:bg-muted"
                    onClick={(e: React.MouseEvent<HTMLSpanElement>) =>
                      handleRemove(e.nativeEvent, option)
                    }
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </span>
                )}
              </Badge>
            ))}
          </>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
      </div>

      {open && !disabled && (
        <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover shadow-md">
          <div className="flex items-center border-b px-3">
            <input
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {availableOptions.length > 0 ? (
              availableOptions.map((option) => (
                <div
                  key={option.id}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-black"
                  onClick={() => {
                    handleSelect(option);
                  }}
                >
                  {option.name}
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm">
                {searchQuery ? emptyMessage : "All items selected"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
