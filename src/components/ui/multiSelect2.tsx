import React, { useEffect, useState } from "react";
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
  value?: string[]; // <-- controlled value
}

const UserMultiSelect2: React.FC<UserMultiSelectProps> = ({
  userResponse = [],
  onChange,
  placeholder = "Select items",
  labelField = "name",
  keyField = "_id",
  value = [], // <-- default to empty array
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(value);
  const [open, setOpen] = useState(false);

  // Keep internal state in sync with external `value`
  useEffect(() => {
    setSelectedIds(value);
  }, [value]);

  const toggleSelection = (id: string) => {
    let updated: string[];
    if (selectedIds.includes(id)) {
      updated = selectedIds.filter((i) => i !== id);
    } else {
      updated = [...new Set([...selectedIds, id])]; // Ensure uniqueness
    }
    setSelectedIds(updated);
    onChange?.(updated);
  };

  const getLabel = (id: string) =>
    userResponse.find((u) => u[keyField] === id)?.[labelField] ?? id;

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full justify-between rounded-md border px-3 py-2 text-left text-sm shadow-sm"
          >
            <span className="uppercase">
              {selectedIds.length > 0
                ? selectedIds.map(getLabel).join(", ")
                : placeholder}
            </span>
            {/* <span className="uppercase">
            {selectedIds.length > 0
                ? selectedIds.map((id) => getLabel(id).split("-")[0]).join(", ")
                : placeholder}
            </span> */}

            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full max-h-64">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              {/* {userResponse.map((item) => {
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
              })} */}
              {userResponse.map((item) => {
                const id = item[keyField]; // this should be _id
                const label = item[labelField]; // this is Q1-2025, Q2-2025 etc.
                const selected = selectedIds.includes(label); // compare using label

                return (
                  <CommandItem
                    key={id} // ✅ Unique _id as key
                    onSelect={() => toggleSelection(label)} // ✅ Select by label
                    className="cursor-pointer flex items-center justify-between uppercase"
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

export default UserMultiSelect2;
