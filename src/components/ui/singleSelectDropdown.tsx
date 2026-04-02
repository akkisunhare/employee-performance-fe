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

interface SingleUserSelectProps {
  userResponse: any[];
  onChange?: (selectedId: string | null) => void;
  placeholder?: string;
  labelField?: string;
  keyField?: string;
  value?: string | null;
}

const SingleUserSelect: React.FC<SingleUserSelectProps> = ({
  userResponse = [],
  onChange,
  placeholder = "Select a user",
  labelField = "name",
  keyField = "_id",
  value = null,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(value || null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelectedId(value || null);
  }, [value]);

  const handleSelect = (id: string) => {
    const newValue = id === selectedId ? null : id; // deselect on same click
    setSelectedId(newValue);
    onChange?.(newValue);
    setOpen(false); // close dropdown after select
  };

  const getLabel = (id: string | null) =>
    userResponse.find((u) => u[keyField] === id)?.[labelField] ?? placeholder;

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative group w-[180px]">
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex w-full justify-between rounded-md border px-3 py-2 text-left text-sm shadow-sm"
            >
              <span className="overflow-hidden truncate">
                {selectedId ? getLabel(selectedId) : placeholder}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </button>
          </PopoverTrigger>
        </div>

        <PopoverContent className="p-0 w-full max-h-64">
          <Command>
            <CommandInput placeholder="Search user..." />
            <CommandList>
              {userResponse
                .sort((a, b) =>
                  (a[labelField] || "").localeCompare(b[labelField] || "")
                )
                .map((item) => {
                  const id = item[keyField];
                  const label = item[labelField];
                  const selected = id === selectedId;

                  return (
                    <CommandItem
                      key={id}
                      onSelect={() => handleSelect(id)}
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

export default SingleUserSelect;
