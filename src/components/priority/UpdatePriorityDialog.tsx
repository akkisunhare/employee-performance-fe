import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getStatusColornew } from "../../utils/date";
import { useEffect, useMemo, useState } from "react";
import { PriorityStatus, WeekStatusData } from "@/types/priority";

interface UpdatePriorityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  onSubmit: (payload:any) => boolean| Promise<boolean>;
}

const statusOptions = ["On track", "Not yet started", "Complete", "Not applicable", "Behind schedule"];

// Old Code to disable future week start 20-08-2025
// function isWeekSelectable(weekData: WeekStatusData): boolean {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const endDate = new Date(weekData.endDate);
//   endDate.setHours(0, 0, 0, 0);
//   // Allow past weeks and the current week to be selectable
//   return endDate <= today || (new Date(weekData.startDate) <= today && today <= endDate);
// }
// Old Code to disable future week end 20-08-2025

// New Code to disable current week & future week start 20-08-2025
function isWeekSelectable(weekData: WeekStatusData): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(weekData.startDate);
  const endDate = new Date(weekData.endDate);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  // Disable current and future weeks
  const isCurrentWeek = startDate <= today && today <= endDate;
  const isFuture = startDate > today;
  return !isCurrentWeek && !isFuture;
}
// New Code to disable current week & future week end 20-08-2025

function formatWeekDisplay(weekData: WeekStatusData): string {
  if (!weekData.startDate || !weekData.endDate) {
    return "Select Week";
  }
  
  const startDate = new Date(weekData.startDate);
  const endDate = new Date(weekData.endDate);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return "Select Week";
  }

  return `${weekData.intervalName} (${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
}

export function UpdatePriorityDialog({
  open,
  onOpenChange,
  formData,
  onSubmit
}: UpdatePriorityDialogProps) {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localFormData, setLocalFormData] = useState(formData);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(null);

   // Initialize the selected week index
  useEffect(() => {
    if (open && localFormData.weekStatusdata?.length) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find the current week or the most recent past week
      let defaultIndex = null;
      
      // First try to find the current week
      const currentWeekIndex = formData.weekStatusdata.findIndex((weekData: WeekStatusData) => {
        const startDate = new Date(weekData.startDate);
        const endDate = new Date(weekData.endDate);
        return startDate <= today && today <= endDate;
      });

      if (currentWeekIndex !== -1) {
        defaultIndex = currentWeekIndex;
      } else {
        // If no current week, find the most recent past week
        for (let i = formData.weekStatusdata.length - 1; i >= 0; i--) {
          const weekData = formData.weekStatusdata[i];
          const endDate = new Date(weekData.endDate);
          if (endDate <= today) {
            defaultIndex = i;
            break;
          }
        }
      }

      setSelectedWeekIndex(defaultIndex !== null ? defaultIndex : null);
    }
  }, [open, formData]);

  const currentWeekData = useMemo(() => {
    if (selectedWeekIndex === null || !localFormData.weekStatusdata?.[selectedWeekIndex]) {
      return {
        intervalName: '',
        startDate: '',
        endDate: '',
        status: 'Not applicable',
        description: ''
      };
    }
    return localFormData.weekStatusdata[selectedWeekIndex];
  }, [selectedWeekIndex, localFormData.weekStatusdata]);

const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

  const updatedWeekStatusdata = [...localFormData.weekStatusdata];
    updatedWeekStatusdata[selectedWeekIndex] = {
     ...updatedWeekStatusdata[selectedWeekIndex],
      description: e.target.value
    }
  setLocalFormData({
    ...formData,
    weekStatusdata: updatedWeekStatusdata
  });
};

 const handleStatusChange = (value: PriorityStatus | 'Not able to store') => {

     const updatedWeekStatusdata = [...localFormData.weekStatusdata];
    updatedWeekStatusdata[selectedWeekIndex] ={
        ...updatedWeekStatusdata[selectedWeekIndex],
        status: value
    } ;

  setLocalFormData({
    ...formData,
    weekStatusdata: updatedWeekStatusdata,
    status: value
  });
};

  const handleWeekChange = (indexStr: string) => {

     const index = parseInt(indexStr);
    setSelectedWeekIndex(index);
};

const handleSubmit = async () => {
    if (!currentWeekData) return;

    setIsSubmitting(true);
    try {
      const payload = [{
          intervalIndex: currentWeekData.intervalIndex,
          status: currentWeekData.status,
          description: currentWeekData.description
        }]
      
      const result = await onSubmit(payload)
     if(result){
 onOpenChange(false);
     }
    } catch (error) {
      console.error('Error updating week status:', error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // New Code to set last week default start 20-08-2025
  useEffect(() => {
    if (open && localFormData.weekStatusdata?.length) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let defaultIndex: number | null = null;
      // Loop from latest to oldest → pick the most recent past week
      for (let i = formData.weekStatusdata.length - 1; i >= 0; i--) {
        const weekData = formData.weekStatusdata[i];
        const endDate = new Date(weekData.endDate);
        endDate.setHours(0, 0, 0, 0);
        if (endDate < today) {
          defaultIndex = i;
          break;
        }
      }
      setSelectedWeekIndex(defaultIndex !== null ? defaultIndex : null);
    }
  }, [open, formData]);
  // New Code to set last week default End 20-08-2025

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-6 bg-[#F5F5F5] rounded-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-normal bg-black text-white p-4 rounded-lg">
            Update Priority
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-normal text-base">Priority Name</Label>
             <input
              type="text"
              value={formData.name}
              readOnly
              tabIndex={-1}
              className="p-2 w-full bg-gray-100 text-gray-500 border border-gray-300 rounded-lg shadow-none focus:outline-none select-none cursor-not-allowed"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-normal text-base">Week</Label>
                <Select
                   value={selectedWeekIndex !== null ? selectedWeekIndex.toString() : ""}
                  onValueChange={handleWeekChange}
                >
                <SelectTrigger className="w-full h-24 p-2 border border-gray-300 rounded-lg">
              <div className="w-full h-6 text-left text-sm text-black">
                {currentWeekData !==null ? formatWeekDisplay(currentWeekData) : 'Select Week'}
              </div>
            </SelectTrigger>
                  <SelectContent>
                  {formData.weekStatusdata?.map((weekData: WeekStatusData, index: number) => {
              const isSelectable = isWeekSelectable(weekData);
                  return (
                    <SelectItem
                      key={index}
                      value={index.toString()}
                      disabled={!isSelectable}
                    >
                      {formatWeekDisplay(weekData)}
                    </SelectItem>
                  );
                })}
                  </SelectContent>
                </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-normal text-base">Status</Label>
            <Select
              value={currentWeekData.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full h-24 p-2 border border-gray-300 rounded-lg">
                <div
                  className={`w-25 h-6 flex items-center justify-center text-sm text-white ${getStatusColornew(currentWeekData.status)}`}
                >
                  {currentWeekData.status || "Select status"}
                </div>
              </SelectTrigger>

              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-3">
            <Label className="font-normal text-base">Notes</Label>
            <textarea
              value={currentWeekData.description || ''}
              onChange={handleDescriptionChange}
              className="p-2 w-full h-24 bg-white border border-gray-300 rounded-lg"
              placeholder="Add your weekly update notes here..."
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-start gap-4 w-full">
            <Button
              variant="outline"
               disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="bg-white text-black border border-gray-300 hover:bg-gray-100 w-[120px] h-[40px]"
            >
              Cancel
            </Button>
            <Button
          disabled={isSubmitting || selectedWeekIndex === null}
              onClick={handleSubmit}
              className="bg-black text-white hover:bg-gray-800 w-[168px] h-[40px]"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}