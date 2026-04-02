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
  onChange?: (selectedId: string | null) => void;
  placeholder?: string;
  labelField?: string;
  keyField?: any;
  value?: string | null; // single selection
}

const getCurrentQuarterLabel = () => {
  const now = new Date();
  const year = now.getFullYear();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `Q${quarter}-${year}`.toUpperCase();
};

const SingleSelectQuarter: React.FC<UserMultiSelectProps> = ({
  userResponse = [],
  onChange,
  placeholder = "Select a quarter",
  labelField = "name",
  keyField = "_id",
  value = null,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(value);
  const [open, setOpen] = useState(false); 

  // Set default value to current quarter if nothing is selected
  useEffect(() => {
    if (!value && userResponse.length > 0) {
      const currentQuarterLabel = getCurrentQuarterLabel();
      const match = userResponse.find(
        (item) => item[labelField].toUpperCase() === currentQuarterLabel
      );
      if (match) {
        const label = match[labelField];
        setSelectedId(label);
        onChange?.(label);
      }
    } else {
      setSelectedId(value);
    }
  }, [value, userResponse]);

  const handleSelect = (label: string) => {
    const updated = label === selectedId ? null : label; // Toggle (optional)
    setSelectedId(updated);
    onChange?.(updated);
    setOpen(false);
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full justify-between rounded-md border px-3 py-2 text-left text-sm shadow-sm uppercase"
          >
            <span>
              {selectedId
                ? userResponse.find((u) => u[labelField] === selectedId)?.[labelField] || selectedId
                : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full max-h-64">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              {userResponse.map((item) => {
                const id = item[keyField];
                const label = item[labelField];
                const selected = selectedId === label;

                return (
                  <CommandItem
                    key={id}
                    onSelect={() => handleSelect(label)}
                    className="cursor-pointer flex items-center justify-between uppercase"
                    // disabled={label !== selectedId}
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

export default SingleSelectQuarter;
