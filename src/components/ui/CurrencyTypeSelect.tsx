import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Label } from "./label";

const mockCurrencyTypes = [
  { id: "", name: "None", sign: "" },
  // Major currencies
  { id: "USD", name: "USD", sign: "$" },
  { id: "EUR", name: "EUR", sign: "€" },
  { id: "JPY", name: "JPY", sign: "¥" },
  { id: "GBP", name: "GBP", sign: "£" },
  { id: "AUD", name: "AUD", sign: "A$" },
  { id: "CAD", name: "CAD", sign: "C$" },
  { id: "CHF", name: "CHF", sign: "CHF" },
  { id: "CNY", name: "CNY", sign: "¥" },
  
  // Asian currencies
  { id: "INR", name: "INR", sign: "₹" },
  { id: "KRW", name: "KRW", sign: "₩" },
  { id: "SGD", name: "SGD", sign: "S$" },
  { id: "MYR", name: "MYR", sign: "RM" },
  { id: "THB", name: "THB", sign: "฿" },
  { id: "IDR", name: "IDR", sign: "Rp" },
  { id: "PHP", name: "PHP", sign: "₱" },
  { id: "VND", name: "VND", sign: "₫" },
  { id: "BDT", name: "BDT", sign: "৳" },
  { id: "PKR", name: "PKR", sign: "₨" },
  
  // Middle Eastern
  { id: "AED", name: "AED", sign: "د.إ" },
  { id: "SAR", name: "SAR", sign: "﷼" },
  { id: "QAR", name: "QAR", sign: "﷼" },
  { id: "TRY", name: "TRY", sign: "₺" },
  
  // African
  { id: "ZAR", name: "ZAR", sign: "R" },
  { id: "EGP", name: "EGP", sign: "E£" },
  { id: "NGN", name: "NGN", sign: "₦" },
  
  // European
  { id: "SEK", name: "SEK", sign: "kr" },
  { id: "NOK", name: "NOK", sign: "kr" },
  { id: "DKK", name: "DKK", sign: "kr" },
  { id: "PLN", name: "PLN", sign: "zł" },
  
  // American
  { id: "MXN", name: "MXN", sign: "$" },
  { id: "BRL", name: "BRL", sign: "R$" },
  { id: "ARS", name: "ARS", sign: "$" },
  
  // Others
  { id: "RUB", name: "RUB", sign: "₽" },
  { id: "UAH", name: "UAH", sign: "₴" }
];

type CurrencySelectorProps = {
  formData: { currencyType: string };
  handleFormChange: (field: string, value: string) => void;
  isEditMode: boolean;
  isFieldDisabled: (field: string) => boolean;
};

export function getCurrencySign(currencyType: string): string {
  if (currencyType) {
    const currency = mockCurrencyTypes.find(
      (unit) => unit.id.toLowerCase() === currencyType.toLowerCase()
    );
    return currency ? currency.sign : "";
  } else {
    return ""
  }
}
export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  formData,
  handleFormChange,
  isEditMode,
  isFieldDisabled,
}) => {
  const [open, setOpen] = useState(false);
  const selectedCurrency = mockCurrencyTypes.find(
    (unit) => unit.id === formData.currencyType
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="currency-type">Currency Type</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between font-normal hover:border-gray-300 hover:border-4 hover:bg-white"
            disabled={isEditMode || isFieldDisabled("currencyType")}
          >
            {selectedCurrency
              ? selectedCurrency?.name == 'None' ? selectedCurrency?.name : `${selectedCurrency.sign}-${selectedCurrency.name}`
              : "Select type"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search currency..." />
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandList>
              {mockCurrencyTypes.map((unit: any) => (
                <CommandItem
                  key={unit.id}
                  value={unit.id}
                  onSelect={(value) => {
                    handleFormChange("currencyType", value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      formData.currencyType === unit.id
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                  {unit?.name == 'None' ? unit?.name : `${unit.sign}-${unit.name}`}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
