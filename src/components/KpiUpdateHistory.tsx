"use client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface KpiUpdateHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updates: any[];
  kpiTitle: string;
}

export function KpiUpdateHistory({
  open,
  onOpenChange,
  updates,
  kpiTitle,
}: KpiUpdateHistoryProps) {
  // Sort updates by date (newest first)
  const sortedUpdates = [...updates].sort((a, b) => {
    const dateA = new Date(a.updateDate.split("/").reverse().join("-"));
    const dateB = new Date(b.updateDate.split("/").reverse().join("-"));
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white text-black">
        <div className="bg-black text-white p-4">
          <DialogTitle className="text-xl font-semibold">
            Update History - {kpiTitle}
          </DialogTitle>
        </div>
        <ScrollArea className="p-6 max-h-[60vh]">
          {sortedUpdates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No updates recorded yet
            </div>
          ) : (
            <div className="space-y-6">
              {sortedUpdates.map((update) => {
                // Parse date
                const dateParts = update.updateDate.split("/");
                const updateDate = new Date(
                  `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
                );

                // Format interval type
                const intervalLabel =
                  update.intervalType === "day"
                    ? `Day ${update.intervalIndex + 1}`
                    : update.intervalType === "week"
                    ? `Week ${update.intervalIndex + 1}`
                    : update.intervalType === "month"
                    ? `Month ${update.intervalIndex + 1}`
                    : `Quarter ${update.intervalIndex + 1}`;

                return (
                  <div key={update.id} className="border-b pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{intervalLabel}</div>
                      <div className="text-sm text-gray-500">
                        {formatDistanceToNow(updateDate, { addSuffix: true })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="text-sm">
                        <span className="text-gray-500">Target: </span>
                        {update.targetValue}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Achieved: </span>
                        {update.currentValue}
                      </div>
                    </div>
                    {update.notes && (
                      <div className="text-sm mt-2 bg-gray-100 p-2 rounded">
                        {update.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
