
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Priority } from "@/types/priority";
import {  getStatusColornew } from "../../utils/date";
import { useEffect } from "react";


interface WeekStatusData {
  week: string;
  status: "Not yet started" | "On track" | "Behind schedule" | "Complete" | "Not applicable" | "Not able to store";
}

interface PriorityDialogsProps {
  EditdialogOpen: boolean;
  setEditDialogOpen: (open: boolean) => void;
  UpdatedialogOpen: boolean;
  setUpdateDialogOpen: (open: boolean) => void;
  editFormData: any;
  setEditFormData: (data: any) => void;
  handleEditSubmit: () => void;
  handleUpdateSubmit: () => void;
  quarterResponse:any[]
  priority: Priority;
  teams: any[];
  handleTeamChange: (teamId: string) => void;
  selectedTeamMembers: any[];
}

const statusOptions = ["On track", "Not yet started", "Complete", "Not applicable", "Behind schedule"];

export function PriorityDialogs({
  EditdialogOpen,
  setEditDialogOpen,
  UpdatedialogOpen,
  setUpdateDialogOpen,
  editFormData,
  setEditFormData,
  handleEditSubmit,
  handleUpdateSubmit,
  teams,
  quarterResponse,
  handleTeamChange,
  selectedTeamMembers
}: PriorityDialogsProps) {

  const getQuarterWeeks = (quarter: string) => {
    const match = quarter.match(/q(\d)-?(\d{4})/);
    if (!match) return [];
  
    const [, qStr, yearStr] = match;
    const q = parseInt(qStr, 10);
    const year = parseInt(yearStr, 10);
    const selectedQuarter = quarterResponse.find(
      (qtr) => qtr.quarter.toLowerCase() === `q${q}` && parseInt(qtr.year) === year
    );
  
    if (!selectedQuarter) {
      return []; // No matching quarter found
    }
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startDate = new Date(selectedQuarter.start_date);
    const endDate = new Date(selectedQuarter.end_date);
  
    const weeks = [];
    let currentDate = new Date(startDate);
    let weekCounter = 1;
  
    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekStart.getDate() + 6);
  
      const formatDate = (date: Date) => {
        return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'long' })}`;
      };
  
      weeks.push({
        start: weekStart,
        end: weekEnd,
        display: `Week ${weekCounter} (${formatDate(weekStart)} - ${formatDate(weekEnd)})`,
        startDisplay: formatDate(weekStart),
        endDisplay: formatDate(weekEnd),
        disabled: weekEnd < now
      });
  
      currentDate.setDate(currentDate.getDate() + 7);
      weekCounter++;
    }
  
    return weeks;
  };

  const availableWeeks = getQuarterWeeks(editFormData.quarter);
  useEffect(() => {
    if (availableWeeks.length) {
      const normalizeWeek = (storedWeek: string) => {
        return storedWeek
          ?.toLowerCase()
          .replace("to", "-")
          .replace(/week/i, "Week")
          .replace(/\s+/g, " ")
          .trim();
      };

      // Match Start Week
      if (editFormData.startWeek) {
        const matchedStart = availableWeeks.find((week) => {
          const stored = normalizeWeek(editFormData.startWeek);
          const display = normalizeWeek(week.display);
          return display.includes(stored.split("(")[1]?.split(")")[0]?.trim() || "");
        });

        if (matchedStart && matchedStart.display !== editFormData.startWeek) {
          setEditFormData((prev: any) => ({
            ...prev,
            startWeek: matchedStart.display,
          }));
        }
      }

      // Match End Week
      if (editFormData.endWeek) {
        const matchedEnd = availableWeeks.find((week) => {
          const stored = normalizeWeek(editFormData.endWeek);
          const display = normalizeWeek(week.display);
          return display.includes(stored.split("(")[1]?.split(")")[0]?.trim() || "");
        });

        if (matchedEnd && matchedEnd.display !== editFormData.endWeek) {
          setEditFormData((prev: any) => ({
            ...prev,
            endWeek: matchedEnd.display,
          }));
        }
      }
    }
  }, [editFormData.startWeek, editFormData.endWeek, availableWeeks]);

  return (
    <>
      {/* Edit Priority Dialog */}
      <Dialog open={EditdialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[900px] p-6 bg-[#F5F5F5] rounded-2xl border-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-normal  bg-black text-white p-4 rounded-lg">
              Edit Priority
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-8 p-2">
            {["individual", "team", "company"].map((priorityType) => (
              <label key={priorityType} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value={priorityType}

                  checked={editFormData.type === priorityType}
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                  disabled

                  className="peer hidden"
                />
                <div className="w-4 h-4 rounded-full border-2 border-black flex items-center justify-center
      peer-checked:before:block before:hidden before:w-2 before:h-2 before:bg-black before:rounded-full">
                </div>
                <span className="text-gray-700 capitalize">{priorityType} Priority</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 mt-4 ">
            <div className="space-y-2 ">
              <Label className="font-normal text-base">Priority Name</Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                className="p-2 bg-white text-black autofill:bg-white autofill:text-black border border-gray-300 rounded-lg"
                autoComplete="off"
              />

            </div>
            <div className="space-y-2">
              <Label htmlFor="team" className="font-normal text-base">Select Team</Label>
              <Select
                value={editFormData.team}
                disabled
                onValueChange={handleTeamChange}
              >
                <SelectTrigger className="w-full p-2 bg-white border border-gray-300 rounded-lg">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner" className="font-normal text-base">Select Owner</Label>
              <Select
                value={editFormData.owner?.id || ""}
                disabled
                onValueChange={(value) => {
                  const member = selectedTeamMembers.find(
                    (m) => m._id === value
                  );
                  if (member) {
                    setEditFormData({
                      ...editFormData,
                      owner: { id: member._id, name: member.name }
                    });
                  }
                }}
              >
                <SelectTrigger className="w-full p-2 bg-white border border-gray-300 rounded-lg">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTeamMembers.map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quarter" className="font-normal text-base">Quarter</Label>
              <Input
                id="quarter"
                value={editFormData.quarter
                  .toUpperCase()
                  .replace('-', ' ')}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, quarter: e.target.value })
                }
                disabled
                className="w-full p-2 bg-white border border-gray-300 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startWeek" className="font-normal text-base">Start Week</Label>
              <Select
                value={editFormData.startWeek}
                onValueChange={(value) => {
                  const selectedWeekIndex = availableWeeks.findIndex(week => week.display === value);
                  setEditFormData({
                    ...editFormData,
                    startWeek: value,
                    endWeek:
                      editFormData.endWeek &&
                        availableWeeks.findIndex(week => week.display === editFormData.endWeek) < selectedWeekIndex
                        ? ''
                        : editFormData.endWeek
                  });
                }}
              >
                <SelectTrigger className="w-full p-2 bg-white border border-gray-300 rounded-lg">
                  <SelectValue>{editFormData.startWeek || "Select start week"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableWeeks.map((week, index) => (
                    <SelectItem
                      key={index}
                      value={week.display}
                      disabled={week.disabled}
                    >
                      {week.display}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>
            <div className="space-y-2">
              <Label htmlFor="endWeek" className="font-normal text-base">End Week</Label>
              <Select
                value={editFormData.endWeek}
                onValueChange={(value) =>
                  setEditFormData({
                    ...editFormData,
                    endWeek: value
                  })
                }
              >
                <SelectTrigger className="w-full p-2 bg-white border border-gray-300 rounded-lg">
                  <SelectValue>{editFormData.endWeek || "Select start week"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableWeeks.map((week, index) => {
                    const startWeekIndex = availableWeeks.findIndex(w => w.display === editFormData.startWeek);
                    return (
                      <SelectItem
                        key={index}
                        value={week.display}
                        disabled={startWeekIndex > -1 && index < startWeekIndex}
                      >
                        {week.display}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-3">
  <Label className="font-normal text-base">Notes</Label>
  <textarea
    value={editFormData.weekStatusdata?.[0]?.description || editFormData.description || ''}
    onChange={(e) => {
      // Update both the week-specific description and the main description
      const updatedWeekStatus = {
        ...editFormData.weekStatusdata?.[0],
        description: e.target.value
      };
      
      setEditFormData({
        ...editFormData,
        weekStatusdata: [updatedWeekStatus],
        description: e.target.value
      });
    }}
    className="p-2 w-full h-24 bg-white border border-gray-300 rounded-lg"
  />
</div>

          </div>
          <DialogFooter>
            <div className="flex justify-start gap-4 w-full">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="bg-white text-black border border-gray-300 hover:bg-gray-100 w-[112px] h-[40px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
                className="w-[164px] h-[40px]  bg-black text-white hover:bg-gray-800 "
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Priority Dialog */}
      <Dialog open={UpdatedialogOpen} onOpenChange={setUpdateDialogOpen}>
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
                value={editFormData.name}
                readOnly
                className="p-2 w-full bg-gray-100 text-gray-500 border border-gray-300 rounded-lg shadow-none focus:outline-none select-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-normal text-base">Start Week-End Week</Label>

              {(() => {
                // Calculate today (without time)
                const now = new Date();
                now.setHours(0, 0, 0, 0);

                // Filter out only past or current weeks
                const pastWeeks = editFormData.weekStatusdata?.filter((weekData: WeekStatusData) => {
                  const dateRange = weekData.week.match(/\((.*?)\)/);
                  const [startStr] = dateRange ? dateRange[1].split(' to ').map(date => date.trim()) : [];
                  const year = new Date().getFullYear();
                  const weekStartDate = new Date(`${startStr} ${year}`);
                  return weekStartDate <= now;
                }) || [];

                // Ensure selected week is a past week, else fallback to latest past week
                const selectedWeek = pastWeeks.find((w: WeekStatusData) => w.week === editFormData.weekStatusdata?.[0]?.week)?.week;


                return (
                  <Select
                    value={selectedWeek}
                    onValueChange={(value) => {
                      const selectedWeekObj = editFormData.weekStatusdata?.find((w: WeekStatusData) => w.week === value);
                      if (selectedWeekObj) {
                        setEditFormData({
                          ...editFormData,
                          weekStatusdata: [selectedWeekObj],
                          status: selectedWeekObj.status
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-24 p-2 border border-gray-300 rounded-lg">
                      <div className="w-full h-6 text-left text-sm text-black">
                        {selectedWeek || 'Select week'}
                      </div>
                    </SelectTrigger>

                    <SelectContent>
                      {editFormData.weekStatusdata?.map((weekData: WeekStatusData, index: number) => {
                        const dateRange = weekData.week.match(/\((.*?)\)/);
                        const [startStr] = dateRange ? dateRange[1].split(' to ').map(date => date.trim()) : [];
                        const year = new Date().getFullYear();
                        const weekStartDate = new Date(`${startStr} ${year}`);
                        const isFutureWeek = weekStartDate > now;

                        return (
                          <SelectItem
                            key={index}
                            value={weekData.week}
                            disabled={isFutureWeek}
                          >
                            {weekData.week}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                );
              })()}
            </div>



            <div className="space-y-2">
              <Label className="font-normal text-base">Status</Label>
              <Select
                value={editFormData.weekStatusdata?.[0]?.status || ''}
                onValueChange={(value) => {
                  const updatedWeekStatus = {
                    ...editFormData.weekStatusdata?.[0],
                    status: value,
                  };

                  setEditFormData({
                    ...editFormData,
                    weekStatusdata: [updatedWeekStatus], // Update week-specific status
                    status: value // Optional: also update main status if needed
                  });
                }}
              >
                <SelectTrigger className="w-full h-24 p-2 border border-gray-300 rounded-lg">
                  <div
                    className={`w-25 h-6 flex items-center justify-center text-sm text-white ${getStatusColornew(editFormData.weekStatusdata?.[0]?.status)}`}
                  >
                    {editFormData.weekStatusdata?.[0]?.status || "Select status"}
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
                // value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value
                  })
                }
                className="p-2 w-full h-24 bg-white border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-start gap-4 w-full">
              <Button
                variant="outline"
                onClick={() => setUpdateDialogOpen(false)}
                className="bg-white text-black border border-gray-300 hover:bg-gray-100 w-[120px] h-[40px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSubmit}
                className="bg-black text-white hover:bg-gray-800 w-[168px] h-[40px]"
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
