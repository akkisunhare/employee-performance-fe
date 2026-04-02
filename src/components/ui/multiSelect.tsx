import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";

interface UserMultiSelectProps {
  userResponse: any[];
  onChange?: (selectedIds: string[]) => void;
  placeholder?: string;
  labelField?: string;
  keyField?: any;
  value: string[];
}

const UserMultiSelect: React.FC<UserMultiSelectProps> = ({
  userResponse = [],
  onChange,
  placeholder = "Select items",
  labelField = "name",
  keyField = "_id",
  value = [],
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(value || []);
  const [open, setOpen] = useState(false);

  // Sync with parent changes
  useEffect(() => {
    setSelectedIds(value || []);
  }, [value]);

  const allIds = userResponse.map((item) => item[keyField]);
  const isAllSelected = selectedIds.length === allIds.length;

  const toggleSelection = (id: string) => {
    const updated = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    setSelectedIds(updated);
    onChange?.(updated);
  };

  const toggleSelectAll = () => {
    const updated = isAllSelected ? [] : allIds;
    setSelectedIds(updated);
    onChange?.(updated);
  };

  const getLabel = (id: string) =>
    userResponse.find((u) => u[keyField] === id)?.[labelField] ?? id;

  return (
    // <div className="w-full">
    <div className="w-[180px]">
      <Popover open={open} onOpenChange={setOpen}>
        {/* <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full justify-between rounded-md border px-3 py-2 text-left text-sm shadow-sm"
          >
            <span className="overflow-hidden">
              {selectedIds.length > 0
                ? selectedIds.map(getLabel).join(", ")
                : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </button>
        </PopoverTrigger> */}
        <div className="relative group w-full">
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex w-full justify-between rounded-md border px-3 py-2 text-left text-sm shadow-sm"
            >
              <span className="overflow-hidden truncate">
                {selectedIds.length > 0
                  // 
                  ? [...selectedIds]
    .map(getLabel)
    .sort((a, b) => a.localeCompare(b))
    .join(", ")

                  : placeholder}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </button>
          </PopoverTrigger>

          {/* Tooltip on hover */}
          {selectedIds?.length > 0 && (
          <div className="absolute z-50 w-max max-w-xs bg-white text-black border rounded shadow px-3 py-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none top-full mt-1">
            {/* {selectedIds.map((label, idx) => (
              <div key={idx}>{getLabel(label)}</div>
            ))} */}
            {[...selectedIds]
              .map((id) => getLabel(id))
              .sort((a, b) => a.localeCompare(b))
              .map((label, idx) => (
                <div key={idx}>{label}</div>
            ))}

          </div>
          )}
        </div>

        <PopoverContent className="p-0 w-full max-h-64">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              {/* Select All / Deselect All */}
              <CommandItem
                key="select-all"
                onSelect={toggleSelectAll}
                className="cursor-pointer font-medium text-sm flex items-center justify-between border-b px-2 py-1"
              >
                {isAllSelected ? "Deselect All" : "Select All"}
                {isAllSelected && <Check className="h-4 w-4" />}
              </CommandItem>

              {/* Items */}
              {userResponse.sort((a, b) => {
                const nameA = (a[labelField] || "").toLowerCase();
                const nameB = (b[labelField] || "").toLowerCase();
                return nameA.localeCompare(nameB);
              }).map((item) => {
                const id = item[keyField];
                const label = item[labelField];
                const selected = selectedIds.includes(id);
                return (
                  <CommandItem
                    key={id}
                    onSelect={() => toggleSelection(id)}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    {label}
                    {selected && <Check className="h-4 w-4" />}
                  </CommandItem>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default UserMultiSelect;
