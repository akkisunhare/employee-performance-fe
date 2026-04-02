"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { dateFormate } from "@/utils/ReusableFunctions";

// Add getRelativeTimeString function
function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} Minutes Ago`;
    }
    return `${diffInHours} Hours Ago`;
  }
  return `${diffInDays} Days Ago`;
}

interface UpdateKpiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpiData: any;
  onUpdate: (updatedData: any) => Promise<boolean>;
}

export function UpdateKpiDialog({
  open,
  onOpenChange,
  kpiData,
  onUpdate,
}: UpdateKpiDialogProps) {
  const { toast } = useToast();
  const [selectedInterval, setSelectedInterval] = React.useState<string>("");
  const [currentValue, setCurrentValue] = React.useState<number| null>(null);
  const [inputValue, setInputValue] = React.useState<string>("");

  const [notes, setNotes] = React.useState<string>("");
  const [intervalOptions, setIntervalOptions] = React.useState<any[]>([]);
  const [targetValue, setTargetValue] = React.useState<number>(0);
  const [updateDate, setUpdateDate] = React.useState<string>(
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  );

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const frequency = kpiData?.frequency || "weekly";

  const stripTime = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };
  
  //   // Old Method start 18-08-2025
  // Generate interval options based on frequency
  // const getIntervalOptions = async () => {
  //   if (!kpiData?.breakdownData?.length) return [];
  //   const intervalBreakdown = kpiData.breakdownData;
  //   const now = stripTime(new Date());
  //   let currentWeekIndex = -1;
  //   for (let i = 0; i < intervalBreakdown.length; i++) {
  //     const interval = intervalBreakdown[i];
  //     const weekStart = stripTime(new Date(interval.startDate));
  //     const weekEnd = stripTime(new Date(interval.endDate));
  //     if (now >= weekStart && now <= weekEnd) {
  //       currentWeekIndex = interval.intervalIndex;
  //       break;
  //     }
  //   }
  //   const lastWeekIndex = currentWeekIndex > 0 ? currentWeekIndex - 1 : -1;
  //   const formatDate = (date: Date) => {
  //     return date.toLocaleDateString("en-US", {
  //       month: "short",
  //       day: "numeric",
  //     });
  //   };
  // const intervalOptions = intervalBreakdown
  //   .map((interval: any) => {
  //     const weekStart = stripTime(new Date(interval.startDate));
  //     const weekEnd = stripTime(new Date(weekStart));
  //     weekEnd.setDate(weekStart.getDate() + 6);

  //     const isCurrentWeek = now >= weekStart && now <= weekEnd;
  //     const isLastWeek =
  //       interval.intervalIndex == lastWeekIndex &&
  //       interval.intervalTarget > 0;
  //     const isPast = !isCurrentWeek && !isLastWeek && weekEnd < now;
  //     const isFuture = !isCurrentWeek && !isLastWeek && weekStart > now;

  //     const hasTarget = interval.intervalTarget > 0;
  //     const notes = interval.notes;
  //     return {
  //       value: interval.intervalName,
  //       label: interval.intervalName,
  //       targetValue: interval.intervalTarget || 0.00,
  //       notes: notes,
  //       currentValue: interval.intervalContribution || 0,
  //       isPast: isPast,
  //       isFuture: isFuture,
  //       isUnEditable: isFuture || (!hasTarget && isPast),  // Old Update Kpi 7-7-25
  //       // isUnEditable: isFuture || (!hasTarget && isPast)|| isPast,   // New 
  //       startDate: weekStart.toISOString(),
  //       endDate: weekEnd.toISOString(),
  //       dateRange: `${formatDate(weekStart)} to ${formatDate(weekEnd)}`,
  //       isCurrentWeek, // Mark this interval as the current week
  //       isLastWeek,
  //       isUpdated: interval.isUpdated ?? false,
  //     };
  //   })
  //   .filter(
  //     (interval: any) =>
  //       interval.isPast ||
  //       interval.isFuture ||
  //       interval.isCurrentWeek ||
  //       interval.isLastWeek
  //   );
  //   return intervalOptions;
  // };
  //   // Old Method end 18-08-2025

  const getIntervalOptions = async () => {
    if (!kpiData?.breakdownData?.length) return [];
    const intervalBreakdown = kpiData.breakdownData;
    const now = stripTime(new Date());
    let currentWeekIndex = -1;
    for (let i = 0; i < intervalBreakdown.length; i++) {
      const interval = intervalBreakdown[i];
      const weekStart = stripTime(new Date(interval.startDate));
      const weekEnd = stripTime(new Date(interval.endDate));
      if (now >= weekStart && now <= weekEnd) {
        currentWeekIndex = interval.intervalIndex;
        break;
      }
    }
    const lastWeekIndex = currentWeekIndex > 0 ? currentWeekIndex - 1 : -1;
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };
    // 🔥 find KPI start week (first week with non-zero target)
    const kpiStartIndex = intervalBreakdown.findIndex(
      (interval: any) => interval.intervalTarget > 0
    );
    if (kpiStartIndex === -1) return [];
    const intervalOptions = intervalBreakdown.map((interval: any) => {
      const weekStart = stripTime(new Date(interval.startDate));
      const weekEnd = stripTime(new Date(weekStart));
      weekEnd.setDate(weekStart.getDate() + 6);
      const isCurrentWeek = now >= weekStart && now <= weekEnd;
      const isLastWeek =
        interval.intervalIndex == lastWeekIndex && interval.intervalTarget > 0;
      const isPast = !isCurrentWeek && !isLastWeek && weekEnd < now;
      const isFuture = !isCurrentWeek && !isLastWeek && weekStart > now;
      // 👇 Disable all weeks before KPI start week
      const isBeforeKpiStart = interval.intervalIndex < kpiStartIndex;
      return {
        value: interval.intervalName,
        label: interval.intervalName,
        targetValue: interval.intervalTarget || 0.0,
        notes: interval.notes,
        currentValue: interval.intervalContribution || 0,
        isPast,
        isFuture,
        isUnEditable: isBeforeKpiStart || isFuture || isCurrentWeek,
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
        dateRange: `${formatDate(weekStart)} to ${formatDate(weekEnd)}`,
        isCurrentWeek,
        isLastWeek,
        isUpdated: interval.isUpdated ?? false,
        isBeforeKpiStart,
      };
    });
    return intervalOptions;
  };

  React.useEffect(() => {
    if (open) {
      const loadOptions = async () => {
        const options = await getIntervalOptions();
        setIntervalOptions(options);
      };

      loadOptions();
    }
  }, [open]);
  // Get the label for the interval selection based on frequency
  const getIntervalLabel = () => {
    switch (frequency) {
      case "daily":
        return "Select Day";
      case "weekly":
        return "Select Week";
      case "monthly":
        return "Select Month";
      case "quarterly":
        return "Select Quarter";
      default:
        return "Select Interval";
    }
  };

  // Reset form when dialog is opened
  // React.useEffect(() => {
  //   if (open && intervalOptions.length) {
  //     // Find the current interval
  //     const currentInterval = intervalOptions.find(
  //       (interval: any) => interval.isCurrentWeek
  //     );

  //     if (currentInterval) {
  //       setSelectedInterval(currentInterval.value);
  //       setTargetValue(currentInterval.targetValue);
  //       setCurrentValue(currentInterval.currentValue);

  //       const shouldShowZero =
  //       currentInterval.currentValue === 0 && currentInterval.isUpdated;
    
  //       setInputValue(
  //         shouldShowZero
  //           ? "0"
  //           : currentInterval.currentValue == 0
  //           ? ""
  //           : String(currentInterval.currentValue)
  //       );
  //     } else {
  //       setSelectedInterval("");
  //       setCurrentValue(0);
  //       setTargetValue(0);
  //       setInputValue("");
  //     }

  //     // setNotes("");
  //     setNotes(currentInterval?.notes || "")
  //     setUpdateDate(
  //       new Date().toLocaleDateString("en-US", {
  //         month: "2-digit",
  //         day: "2-digit",
  //         year: "numeric",
  //       })
  //     );
  //   }
  // }, [open, intervalOptions]); // Only depend on open state

  React.useEffect(() => {
  if (!open || !intervalOptions.length) return;

  // Prefer last week; else pick the most recent editable past interval
  const lastWeek = intervalOptions.find((opt: any) => opt.isLastWeek && !opt.isUnEditable);
  const recentEditable = [...intervalOptions].reverse().find((opt: any) => !opt.isUnEditable);
  const defaultOpt = lastWeek || recentEditable || null;

  if (defaultOpt) {
    setSelectedInterval(defaultOpt.value);
    setTargetValue(defaultOpt.targetValue || 0);
    setCurrentValue(defaultOpt.currentValue || 0);

    const shouldShowZero = defaultOpt.currentValue === 0 && defaultOpt.isUpdated;
    setInputValue(
      shouldShowZero
        ? "0"
        : defaultOpt.currentValue == 0
        ? ""
        : String(defaultOpt.currentValue)
    );

    setNotes(defaultOpt.notes || "");
  } else {
    // nothing selectable (edge case)
    setSelectedInterval("");
    setTargetValue(0);
    setCurrentValue(0);
    setInputValue("");
    setNotes("");
  }

  setUpdateDate(
    new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
  );
}, [open, intervalOptions]);


  // Old Method to by default select the current week 18-08-2025
  // Update target value when interval is selected
  // const handleIntervalChange = (value: string) => {
  //   setSelectedInterval(value);
  //   const selectedOption = intervalOptions.find(
  //     (opt: any) => opt.value === value
  //   );
  //   setNotes(selectedOption.notes || "")
  //   if (selectedOption) {
  //     setTargetValue(selectedOption.targetValue || 0);
  //     setCurrentValue(selectedOption.currentValue || 0);
  //     setInputValue(selectedOption.currentValue || 0)
  //   }
  // };

  // New Method to by default select the last week 18-08-2025
  const handleIntervalChange = (value: string) => {
    setSelectedInterval(value);
    const selectedOption = intervalOptions.find((opt: any) => opt.value === value);
    setNotes(selectedOption?.notes || "");
    if (selectedOption) {
      setTargetValue(selectedOption.targetValue || 0);
      setCurrentValue(selectedOption.currentValue || 0);
      const shouldShowZero =
        selectedOption.currentValue === 0 && selectedOption.isUpdated;
      setInputValue(
        shouldShowZero
          ? "0"
          : selectedOption.currentValue == 0
          ? ""
          : String(selectedOption.currentValue)
      );
    }
  };

  // Handle current value change
  const handleCurrentValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value;

  // Allow blank
  if (value === "") {
    setInputValue("");
    setCurrentValue(0);
    return;
  }

  // Allow valid number input up to 2 decimal places
  const valid = /^\d*\.?\d{0,2}$/.test(value);
  if (valid) {
    setInputValue(value);
    const parsed = parseFloat(value);
    setCurrentValue(isNaN(parsed) ? 0 : parsed);
  }
};
  

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedInterval) {
      toast({
        title: "Error",
        description: `Please select a ${getIntervalLabel().toLowerCase()}`,
        variant: "destructive",
      });
      return;
    }

    const selectedOption = intervalOptions.find(
      (opt: any) => opt.value === selectedInterval
    );

    if (
      selectedOption &&
      selectedOption.isPast &&
      selectedOption.isUnEditable
   ) {
     toast({
       title: "Error",
       description: "Cannot update past intervals. Please select an ongoing or upcoming interval.",
       variant: "destructive",
     });
     return;
   }
   if (inputValue === "" && notes.trim() === "") {
    toast({
      title: "No Changes",
      description: "No changes to update.",
    });
    return;
  }

  // if (
  //   selectedOption &&
  //   currentValue !== null &&
  //   currentValue > 0 &&
  //   parseFloat(currentValue.toFixed(2)) ===
  //     parseFloat((selectedOption.currentValue ?? 0).toFixed(2)) &&
  //   notes.trim() === ""
  // ) {
  //   toast({
  //     title: "No Changes",
  //     description: "No changes to update.",
  //   });
  //   return;
  // } 
    setIsSubmitting(true);

    try {
      const intervalParts = selectedInterval.split(" ");
      const intervalType = intervalParts[0]; // "day", "week", "month", or "quarter"
      const intervalIndex = Number.parseInt(intervalParts[1]) - 1;

      // Create update data
      const updateData = {
        intervalType,
        intervalIndex,
        currentValue: Number(currentValue) || 0,
        targetValue: Number(targetValue) || 0,
        notes,
        isUpdated:true,
        updateDate,
        // Add fields for the new schema
        intervalName:
          intervalOptions.find((opt: any) => opt.value === selectedInterval)
            ?.label || "",
        user: {
          id: kpiData.ownerId.id,
          name: kpiData.ownerId.name,
        },
      };
      const success = await onUpdate(updateData);

      if (success) {
        onOpenChange(false);
        toast({
          title: "KPI Updated",
          description: `Progress updated for ${
            intervalOptions.find((opt: any) => opt.value === selectedInterval)
              ?.label
          }`,
        });
      }
    } catch (error) {
      console.error("Error updating KPI:", error);
      toast({
        title: "Error",
        description: "Failed to update KPI progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-[#F8F8F8] text-black">
        <div className="bg-black text-white p-4 ">
          <DialogTitle className="text-xl font-semibold">
            Update KPI
          </DialogTitle>
        </div>
        <div className="p-2 space-y-1 ">
          <div className="bg-[#FFFFFF] rounded-lg p-2">
            {/* Add Last Updated Info */}
            {kpiData.lastUpdatedBy && (
              <div className="text-sm text-gray-600 mb-4">
                Last Updated:{" "}
                {getRelativeTimeString(new Date(kpiData.updatedAt))}{" "}
                <span className="mx-4">By: {kpiData.lastUpdatedBy.name}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 space-y-3">
              <div className="space-y-2 ">
                <Label htmlFor="select-interval">{getIntervalLabel()}</Label>
                <Select
                  value={selectedInterval}
                  onValueChange={handleIntervalChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={`Select a ${
                        frequency === "daily"
                          ? "Day"
                          : frequency === "weekly"
                          ? "Week"
                          : frequency === "monthly"
                          ? "Month"
                          : "Quarter"
                      }`}
                      className="!w-full"
                    />
                  </SelectTrigger>
                  <SelectContent className="!w-full ">
                    {intervalOptions.length &&
                      intervalOptions.map((interval: any) => (
                        // <SelectItem
                        //   key={interval.value}
                        //   value={interval.value}
                        //   disabled={interval.isUnEditable}
                        // >
                        //   {interval.label} ({interval.dateRange})
                        //   {interval.isPast ? "(Past)" : ""}{" "}
                        //   {interval.isLastWeek ? "Last Week" : ""}{" "}
                        //   {interval.isCurrentWeek ? "(Present)" : ""}
                        //   {interval.isFuture ? "(Future)" : ""}{" "}
                        //   {/* {interval.isUnEditable ? "(No Target Value)" : ""} */}
                        // </SelectItem>

                        <SelectItem
                          key={interval.value}
                          value={interval.value}
                          disabled={interval.isUnEditable}
                        >
                          {interval.label} ({interval.dateRange})
                          {interval.isPast ? "(Past)" : ""}
                          {interval.isLastWeek ? "Last Week" : ""}
                          {interval.isCurrentWeek ? "(Current - Disabled)" : ""}
                          {interval.isFuture ? "(Future - Disabled)" : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="update-date">Update Date</Label>
                <Input id="update-date" value={dateFormate(updateDate)} readOnly />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="current-value">Current Value</Label>
                <Input
                id="current-value"
                value={inputValue}
                onChange={handleCurrentValueChange}
                placeholder="Enter current value"
                type="text"
                inputMode="decimal"
                maxLength={8}
                disabled={targetValue===0}
              />

              </div>
              <div className="space-y-2">
                <Label htmlFor="target-value">Target Value</Label>
                <Input
                  id="target-value"
                  value={targetValue}
                  placeholder="0"
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={handleNotesChange}
                placeholder="Add any notes about this update"
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-black/90"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
