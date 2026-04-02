"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { KpiFormData } from "@/types/kpi";

// Static data for UI demonstration
const defaultQuarters = [
  { id: "q1-2025", name: "Q1 2025" },
  { id: "q2-2025", name: "Q2 2025" },
  { id: "q3-2025", name: "Q3 2025" },
  { id: "q4-2025", name: "Q4 2025" },
];

const defaultFrequencies = [
  { id: "daily", name: "Daily" },
  { id: "weekly", name: "Weekly" },
  { id: "monthly", name: "Monthly" },
  { id: "quarterly", name: "Quarterly" },
];

interface AdditionalInfoProps {
  formData: KpiFormData;
  onFormChange: (field: string, value: any) => void;
  isQuarterInPast: (quarter: string) => boolean;
  isEditMode?: boolean;
  isFieldDisabled?: (fieldName: string) => boolean;
  quarters?: typeof defaultQuarters;
  frequencies?: typeof defaultFrequencies;
}

export function AdditionalInfo({
  formData,
  onFormChange,
  isQuarterInPast,
  isEditMode = false,
  isFieldDisabled = () => false,
  quarters = defaultQuarters,
  frequencies = defaultFrequencies,
}: AdditionalInfoProps) {
  const { inheritedFields = {} } = formData;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="quarter" className="flex items-center gap-1">
            Quarter
            {inheritedFields.quarter && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Inherited from parent KPI
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
          <Select
            value={formData.quarter || quarters[0].id}
            onValueChange={(value) => onFormChange("quarter", value)}
            disabled={
              inheritedFields.quarter ||
              isEditMode ||
              isFieldDisabled("quarter")
            }
          >
            <SelectTrigger
              className={inheritedFields.quarter ? "bg-blue-50" : ""}
            >
              <SelectValue placeholder="Select quarter" />
            </SelectTrigger>
            <SelectContent>
              {quarters.map((quarter) => (
                <SelectItem
                  key={quarter.id}
                  value={quarter.id}
                  disabled={isQuarterInPast(quarter.id)}
                  className={isQuarterInPast(quarter.id) ? "text-gray-400" : ""}
                >
                  {quarter.name} {isQuarterInPast(quarter.id) ? "(Past)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="current-value">Current Value</Label>
          <Input
            id="current-value"
            placeholder="Enter the Current Value"
            value={formData.currentValue || ""}
            onChange={(e) => {
              // Only allow numbers and decimal point
              const value = e.target.value.replace(/[^0-9.]/g, "");
              onFormChange("currentValue", value);
            }}
            disabled={isEditMode || isFieldDisabled("currentValue")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="frequency" className="flex items-center gap-1">
            Frequency
            {inheritedFields.frequency && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Inherited from parent KPI
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
          <Select
            value={formData.frequency || frequencies[0].id}
            onValueChange={(value) => onFormChange("frequency", value)}
            disabled={
              inheritedFields.frequency ||
              isEditMode ||
              isFieldDisabled("frequency")
            }
          >
            <SelectTrigger
              className={inheritedFields.frequency ? "bg-blue-50" : ""}
            >
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {frequencies.map((freq) => (
                <SelectItem key={freq.id} value={freq.id}>
                  {freq.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
