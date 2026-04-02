"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface LinkKpiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchingTeams: any[];
  onLink: (teamId: string, type: string) => Promise<void>;
  selectedLinkingType: string;
}

export function LinkKpiDialog({
  open,
  onOpenChange,
  matchingTeams,
  onLink,
  selectedLinkingType
}: LinkKpiDialogProps) {
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = React.useState<string>("");
  const [type, setType] = React.useState<string>("");
  const handleLink = async () => {
    if (!selectedTeam) {
      toast({
        title: "Error",
        description: "Please select a team to link",
        variant: "destructive",
      });
      return;
    }

    try {
      await onLink(selectedTeam,type);
      onOpenChange(false);
    } catch (error) {
      console.error("Error linking KPI to team:", error);
      toast({
        title: "Error",
        description: "Failed to link KPI to team",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white text-black">
        <div className="bg-black text-white p-4">
          <DialogTitle className="text-xl font-semibold">
          {selectedLinkingType === "individual" ? "Link KPI to Team" : "Link KPI to Company"}
          </DialogTitle>
        </div>
        <div className="p-6 space-y-4">
          <DialogHeader>
            <div className="text-sm text-gray-500">
            {selectedLinkingType === "individual"
            ? "Select a team to link this KPI to. The team must have matching criteria (frequency, quarter, measurement unit, division type)."
            : "Select a company to link this KPI to. The company must have matching criteria (frequency, quarter, measurement unit, division type)."}
            </div>
          </DialogHeader>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {matchingTeams.map((team) => (
              <button
                key={team._id}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedTeam === team._id
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  setSelectedTeam(team._id);
                  setType(team.kpiType);
                }}
              >
                <div className="font-medium">{team.name}</div>
                <div className="text-sm text-gray-500">
                  Owner: {team.ownerId.name}
                </div>
              </button>
            ))}
          </div>
        </div>
        <DialogFooter className="p-6 bg-gray-50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLink}
            disabled={!selectedTeam}
            className="bg-black text-white hover:bg-gray-800"
          >
            Link KPI
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 