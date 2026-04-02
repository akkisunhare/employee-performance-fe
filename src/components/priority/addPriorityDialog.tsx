// import { useState, useEffect, useCallback } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { QuarterService } from "@/services/quaterService";
// import { getCurrentQuarter } from "../AddKPIDialog";
// import { TeamService } from "@/services/teams";
// import { useToast } from "@/hooks/use-toast";
// import { Interval } from "@/types/kpi";
// import { getIntervalLabels } from "../kpi/KpiConstant";
// import { formatDateRange } from "./priorityConstant";
// import { WeekInterval } from "@/types/priority";
// import { useAuth } from "@/contexts/AuthContext";

// interface PriorityDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   mode: "add" | "edit";
//   initialData?: any;
//   onSave?: (formData: any) => boolean | Promise<boolean>;
// }

// type PriorityType = "individual" | "team" | "company";

// interface FormData {
//   name: string;
//   team: string;
//   owner: string;
//   quarter: string;
//   startWeek: WeekInterval | null;
//   endWeek: WeekInterval | null;
//   description: string;
//   type: PriorityType;
//   quarterStartDate?: string;
//   quarterEndDate?: string;
//   status: 'Not yet started' | 'On track' | 'Behind schedule' | 'Complete' | 'Not applicable';
// }

// export const AddPriorityDialog = ({
//   open,
//   onOpenChange,
//   mode,
//   initialData,
//   onSave
// }: PriorityDialogProps) => {
//   const { toast } = useToast();
//   const [quarterResponse, setQuarterResponse] = useState<any[]>([]);
//   const [teams, setTeams] = useState<any[]>([]);
//   const [currentWeek, setCurrentWeek] = useState<Interval | null>(null);
//   const [selectedTeamMembers, setSelectedTeamMembers] = useState<any[]>([]);
//   const [intervals, setIntervals] = useState<Interval[]>([]);
//   const [priority, setPriority] = useState("individual");
//   const [formData, setFormData] = useState<FormData>({
//     name: "",
//     team: "",
//     owner: "",
//     quarter: "",
//     startWeek: null,
//     endWeek: null,
//     description: "",
//     type: "individual",
//     status: "Not yet started"
//   });
//   const [validationErrors, setValidationErrors] = useState({
//     name: "",
//     team: "",
//     owner: "",
//     startWeek: "",
//     endWeek: "",
//   });
//   const { user: userCheck } = useAuth();

//   useEffect(() => {
//     if (mode === "edit" && initialData) {
//       const transformedData = {
//         ...initialData,
//         team: initialData.team?._id || "",
//         owner: initialData.owner?._id || "",
//         startWeek: initialData.startWeek 
//           ? { 
//               ...initialData.startWeek,
//               startDate: new Date(initialData.startWeek.startDate),
//               endDate: new Date(initialData.startWeek.endDate)
//             } 
//           : null,
//         endWeek: initialData.endWeek
//           ? {
//               ...initialData.endWeek,
//               startDate: new Date(initialData.endWeek.startDate),
//               endDate: new Date(initialData.endWeek.endDate)
//             }
//           : null
//       };
      
//       setFormData(transformedData);
//       setPriority(initialData.type);
      
//       if (initialData.team?._id) {
//         const selectedTeam = teams.find(team => team._id === initialData.team._id);
//         if (selectedTeam) {
//           setSelectedTeamMembers(selectedTeam.memberIds);
//         }
//       }
//     } else {
//       setFormData({
//         name: "",
//         team: "",
//         owner: "",
//         quarter: "",
//         startWeek: null,
//         endWeek: null,
//         description: "",
//         status: "Not yet started",
//         type: "individual",
//       });
//       setPriority("individual");
//       setValidationErrors({
//         name: "",
//         team: "",
//         owner: "",
//         startWeek: "",
//         endWeek: "",
//       });
//     }
//   }, [mode, initialData, open, teams]);

//   const fetchTeams = async () => {
//     try {
//       const response = await TeamService.getTeams();
//       setTeams(response.data);
//     } catch (error) {
//       console.error("Error fetching teams:", error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch teams. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const fetchQuarterData = useCallback(async () => {
//     const quarter = formData.quarter || getCurrentQuarter();
//     const match = quarter.match(/q(\d)-(\d{4})/);
//     if (!match) {
//       console.error("Invalid quarter format:", quarter);
//       return;
//     }

//     const [, , yearStr] = match;

//     try {
//       const response: any = await QuarterService.getCurrentYearQuaters(yearStr);
//       if (response.data) {
//         setQuarterResponse(response.data);
//         const today = new Date();
//         let currentQuarter: string | null = null;
//         let currentQuarterStartDate: string | null = null;
//         let currentQuarterEndDate: string | null = null;
//         for (let i = 0; i < response.data.length; i++) {
//           const quarter = response.data[i];
//           const quarterStart = new Date(quarter.start_date);
//           const quarterEnd = new Date(quarter.end_date);

//           if (today >= quarterStart && today <= quarterEnd) {
//             currentQuarter = `${quarter.quarter}-${quarter.year}`;
//             currentQuarterStartDate = quarter.start_date;
//             currentQuarterEndDate = quarter.end_date;
//             break;
//           }
//         }

//         if (currentQuarter && mode === 'add') {
//           setFormData((prevData: any) => ({
//             ...prevData,
//             quarter: currentQuarter,
//             quarterStartDate: currentQuarterStartDate,
//             quarterEndDate: currentQuarterEndDate,
//           }));
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching quarter data:", error);
//     }
//   }, [formData.quarter]);

//   useEffect(() => {
//     if (!open) return;
//     const initialize = async () => {
//       try {
//         await fetchTeams();
//         await fetchQuarterData();
//       } finally {
//       }
//     };
//     initialize();
//   }, [open]);

//   useEffect(() => {
//     const fetchIntervals = async () => {
//       if (formData.quarterStartDate && formData.quarterEndDate) {
//         const calculatedIntervals = await getIntervalLabels(
//           "weekly",
//           formData.quarter,
//           formData.quarterStartDate,
//           formData.quarterEndDate
//         );
//         if (calculatedIntervals.length > 0) {
//           setIntervals(calculatedIntervals);

//           const today = new Date();
//           const currentWeek = calculatedIntervals.find((interval) => {
//             const startDate = new Date(interval.startDate);
//             const endDate = new Date(interval.endDate);
//             return today >= startDate && today <= endDate;
//           });
//           setCurrentWeek(currentWeek || null);
//           if (currentWeek && mode === 'add') {
//             const newStartWeek: WeekInterval = {
//               intervalIndex: calculatedIntervals.findIndex(
//                 (i) => i.startDate === currentWeek.startDate
//               ),
//               intervalName: currentWeek.label,
//               startDate: new Date(currentWeek.startDate),
//               endDate: new Date(currentWeek.endDate),
//             };
//             setFormData((prevData) => ({
//               ...prevData,
//               startWeek: newStartWeek,
//               endWeek: newStartWeek
//             }))
//           }
//         }
//       }
//     };

//     fetchIntervals();
//   }, [formData.quarter, formData.quarterStartDate, formData.quarterEndDate]);

//   const handleTeamChange = (teamId: string) => {
//     const selectedTeam = teams.find((team) => team._id === teamId);
//     if (selectedTeam) {
//       setSelectedTeamMembers(selectedTeam.memberIds);
//       setFormData({
//         ...formData,
//         team: teamId,
//         owner: "",
//       });
//     }
//   };

//   const validateForm = useCallback(() => {
//     const errors = {
//       name: !formData.name ? "Priority name is required" : "",
//       team: !formData.team && "Team is required",
//       owner: !formData.owner && "Owner is required",
//       startWeek: !formData.startWeek ? "Start week is required" : "",
//       endWeek: !formData.endWeek ? "End week is required" : "",
//     };

//     if (formData.startWeek && currentWeek && mode === 'add' &&
//       new Date(formData.startWeek.endDate) < new Date(currentWeek.startDate)) {
//       errors.startWeek = "Cannot select a week in the past";
//     }

//     setValidationErrors(errors);
//     return Object.values(errors).every(error => !error);
//   }, [formData, priority, currentWeek]);

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       return;
//     }
//     try {
//       const result = await onSave(formData);
//       if (result) {
//         onOpenChange(false);
//         setFormData({
//           type: "individual",
//           name: "",
//           owner: "",
//           team: "",
//           quarter: "",
//           startWeek: null,
//           endWeek: null,
//           description: "",
//           status: "Not yet started",
//           quarterStartDate: undefined,
//           quarterEndDate: undefined,
//         })
//       }
//     } catch (error) {
//       console.error('Error creating priority:', error);
//       toast({
//         title: "Error",
//         description: "Failed to create priority. Please try again.",
//         variant: "destructive"
//       });
//     }
//   };

//   // const getWeekPositionInfo = (weekLabel: string) => {
//   //   const currentWeekIndex = intervals.findIndex((w) => w.label === weekLabel);
//   //   const startWeekIndex = formData.startWeek
//   //     ? intervals.findIndex((w) => w.label === formData.startWeek.intervalName)
//   //     : -1;
//   //   const endWeekIndex = formData.endWeek
//   //     ? intervals.findIndex((w) => w.label === formData.endWeek.intervalName)
//   //     : -1;

//   //   const isBeforeStartWeek =
//   //     startWeekIndex >= 0 && currentWeekIndex < startWeekIndex;
//   //   const isAfterEndWeek = endWeekIndex >= 0 && currentWeekIndex > endWeekIndex;

//   //   return {
//   //     isBeforeStartWeek,
//   //     isAfterEndWeek,
//   //     isInvalidStart: isAfterEndWeek,
//   //     isInvalidEnd: isBeforeStartWeek,
//   //   };
//   // };

//   // Helper function to determine if a week should be disabled
//   const shouldDisableWeek = (interval: Interval) => {
//     const isPastWeek = new Date(interval.endDate) < new Date();
    
//     // In edit mode, check user permissions for past weeks
//     if (mode === "edit" && isPastWeek) {
//       return !userCheck?.isUserEdit; // Disable if user doesn't have edit permission
//     }
    
//     // For add mode or non-past weeks, use existing logic
//     if (mode === "add") {
//       return isPastWeek;
//     }
    
//     return false;
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[900px] p-6 bg-[#F5F5F5] rounded-2xl border-none">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-normal bg-black text-white p-3 rounded-lg">
//             {mode === "add" ? "Add Priority" : "Edit Priority"}
//           </DialogTitle>
//         </DialogHeader>

//         {/* Priority Type Selection */}
//         <div className="flex items-center space-x-8 p-2">
//           {["individual", "team", "company"].map((priorityType) => (
//             <label
//               key={priorityType}
//               className="flex items-center space-x-2 cursor-pointer"
//             >
//               <input
//                 type="radio"
//                 value={priorityType}
//                 checked={priority === priorityType}
//                 onChange={() => {
//                   if (mode === "add") {
//                     setPriority(priorityType);
//                     localStorage.setItem("priorityType", priorityType);
//                   }
//                 }}
//                 disabled={mode === "edit"}
//                 className="peer hidden"
//               />
//               <div className="w-4 h-4 rounded-full border-2 border-black flex items-center justify-center peer-checked:before:block before:hidden before:w-2 before:h-2 before:bg-black before:rounded-full"></div>
//               <span className="text-gray-700 capitalize">
//                 {priorityType} Priority
//               </span>
//             </label>
//           ))}
//         </div>

//         {/* Form Fields */}
//         <div className="grid grid-cols-3 gap-6">
//           {/* Priority Name */}
//           <div className="space-y-2">
//             <Label className="font-normal text-base">Priority Name</Label>
//             <Input
//               tabIndex={-1}
//               id="name"
//               value={formData.name}
//               placeholder="Enter the Priority Name"
//               onChange={(e) => {
//                 setFormData({ ...formData, name: e.target.value });
//                 setValidationErrors((prev) => ({ ...prev, name: "" }));
//               }}
//               className={`p-2 bg-white text-black autofill:bg-white autofill:text-black border ${
//                 validationErrors.name ? "border-red-500" : "border-gray-300"
//               } rounded-lg`}
//             />
//             {validationErrors.name && (
//               <p className="text-red-500 text-sm">{validationErrors.name}</p>
//             )}
//           </div>

//           {/* Team Selection */}
//           <div className="space-y-2">
//             <Label htmlFor="team" className="font-normal text-base">
//               Select Team
//             </Label>
//             <Select
//               value={formData.team}
//               onValueChange={handleTeamChange}
//               disabled={mode === "edit" || teams.length === 0}
//             >
//               <SelectTrigger
//                 className={`w-full p-2 bg-white border ${
//                   validationErrors.team ? "border-red-500" : "border-gray-300"
//                 } rounded-lg`}
//               >
//                 <SelectValue
//                   placeholder={
//                     teams.length === 0 ? "No teams available" : "Select team"
//                   }
//                 />
//               </SelectTrigger>
//               {teams.length > 0 ? (
//                 <SelectContent>
//                   {teams.map((team) => (
//                     <SelectItem key={team._id} value={team._id}>
//                       {team.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               ) : (
//                 <SelectContent>
//                   <div className="py-2 px-3 text-gray-500 text-sm">
//                     No teams available
//                   </div>
//                 </SelectContent>
//               )}
//             </Select>
//             {validationErrors.team && (
//               <p className="text-red-500 text-sm">{validationErrors.team}</p>
//             )}
//           </div>

//           {/* Owner Selection */}
//           <div className="space-y-2">
//             <Label htmlFor="owner" className="font-normal text-base">
//               Select Owner
//             </Label>
//             <Select
//               value={formData.owner}
//               onValueChange={(value) => {
//                 const member = selectedTeamMembers.find((m) => m._id === value);
//                 if (member) {
//                   setFormData({
//                     ...formData,
//                     owner: member._id,
//                   });
//                   setValidationErrors((prev) => ({ ...prev, owner: "" }));
//                 }
//               }}
//               disabled={mode === "edit"}
//             >
//               <SelectTrigger
//                 className={`w-full p-2 bg-white ${
//                   validationErrors.owner ? "border-red-500" : "border-gray-300"
//                 } rounded-lg`}
//               >
//                 <SelectValue
//                   placeholder={
//                     selectedTeamMembers.length === 0
//                       ? formData.team
//                         ? "No members in this team"
//                         : "Select a team first"
//                       : "Select owner"
//                   }
//                 />
//               </SelectTrigger>
//               {selectedTeamMembers.length > 0 ? (
//                 <SelectContent>
//                   {selectedTeamMembers.map((member) => (
//                     <SelectItem key={member._id} value={member._id}>
//                       {member.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               ) : (
//                 <SelectContent>
//                   <div className="py-2 px-3 text-gray-500 text-sm">
//                     {formData.team
//                       ? "No members in this team"
//                       : "Please select a team first"}
//                   </div>
//                 </SelectContent>
//               )}
//             </Select>
//             {validationErrors.owner && (
//               <p className="text-red-500 text-sm">{validationErrors.owner}</p>
//             )}
//           </div>
          
//           {/* Quarter Selection */}
//           <div className="space-y-2">
//             <Label className="font-normal text-base">Quarter</Label>
//             {mode === "add" ? (
//               <Select
//                 value={formData.quarter}
//                 onValueChange={(value) => {
//                   const selectedQuarter = quarterResponse.find(
//                     (q) => `${q.quarter}-${q.year}` === value
//                   );
//                   if (selectedQuarter) {
//                     setFormData({
//                       ...formData,
//                       quarter: value,
//                       quarterStartDate: selectedQuarter.start_date,
//                       quarterEndDate: selectedQuarter.end_date,
//                       startWeek: null,
//                       endWeek: null
//                     });
//                   }
//                 }}
//               >
//                 <SelectTrigger className="w-full p-2 bg-white border border-gray-300 rounded-lg">
//                   <SelectValue placeholder="Select quarter">
//                     {formData.quarter
//                       ? (() => {
//                           const [q, y] = formData.quarter.split("-");
//                           return `${q.toUpperCase()} ${y}`;
//                         })()
//                       : "Select quarter"}
//                   </SelectValue>
//                 </SelectTrigger>
//                 <SelectContent>
//                   {quarterResponse.map((quarter) => {
//                     const value = `${quarter.quarter}-${quarter.year}`;
//                     const endDate = new Date(quarter.end_date);
//                     const currentDate = new Date();
//                     const isDisabled = endDate < currentDate;

//                     return (
//                       <SelectItem
//                         key={value}
//                         value={value}
//                         disabled={isDisabled}
//                       >
//                         {`${quarter.quarter.toUpperCase()} ${quarter.year}`}
//                       </SelectItem>
//                     );
//                   })}
//                 </SelectContent>
//               </Select>
//             ) : (
//               <Input
//                 id="quarter"
//                 value={formData.quarter.toUpperCase().replace("-", " ")}
//                 disabled
//                 className="w-full p-2 bg-white border border-gray-300 rounded-lg"
//               />
//             )}
//           </div>

//           {/* Start Week */}
//           <div className="space-y-2">
//             <Label htmlFor="startWeek" className="font-normal text-base">
//               Start Week
//             </Label>
//             <Select
//               value={formData.startWeek?.intervalName || ""}
//               onValueChange={(value) => {
//                 const selectedInterval = intervals.find(
//                   (int) => int.label === value
//                 );

//                 if (selectedInterval) {
//                   const newStartWeek: WeekInterval = {
//                     intervalIndex: intervals.findIndex(
//                       (i) => i.startDate === selectedInterval.startDate
//                     ),
//                     intervalName: selectedInterval.label,
//                     startDate: new Date(selectedInterval.startDate),
//                     endDate: new Date(selectedInterval.endDate),
//                   };
//                   setFormData((prev) => {
//                     let newEndWeek = prev.endWeek;
//                     if (
//                       prev.endWeek &&
//                       new Date(selectedInterval.startDate) >
//                         new Date(prev.endWeek.startDate)
//                     ) {
//                       newEndWeek = newStartWeek;
//                     }
//                     return {
//                       ...prev,
//                       startWeek: newStartWeek,
//                       endWeek: newEndWeek,
//                     };
//                   });
//                 }
//               }}
//             >
//               <SelectTrigger className="w-full p-2 bg-white border border-gray-300 rounded-lg">
//                 <SelectValue
//                   placeholder={
//                     mode === "add"
//                       ? "Select week"
//                       : formData.startWeek?.intervalName || "Select week"
//                   }
//                 >
//                   {mode === "add"
//                     ? formData.startWeek
//                       ? `${formData.startWeek.intervalName} (${formatDateRange(
//                           new Date(formData?.startWeek?.startDate).toISOString(),
//                           new Date(formData.startWeek.endDate).toISOString()
//                         )})`
//                       : "Select week"
//                     : formData.startWeek ? `${formData.startWeek.intervalName} (${formatDateRange(
//                           new Date(formData?.startWeek?.startDate).toISOString(),
//                           new Date(formData.startWeek.endDate).toISOString()
//                         )})` : "Select week"}
//                 </SelectValue>
//               </SelectTrigger>
//               <SelectContent>
//                 {intervals.map((interval) => {
//                   const displayLabel = `${interval.label} (${formatDateRange(
//                     interval.startDate,
//                     interval.endDate
//                   )})`;
                  
//                   const isDisabled = shouldDisableWeek(interval);
//                   const isAfterEndWeek = formData.endWeek
//                     ? new Date(interval.startDate) > new Date(formData.endWeek.endDate)
//                     : false;

//                   return (
//                     <SelectItem
//                       key={interval.label}
//                       value={interval.label}
//                       disabled={isDisabled || isAfterEndWeek}
//                       className="py-2 px-3"
//                     >
//                       {displayLabel}
//                       {isDisabled && !isAfterEndWeek && " (Past week)"}
//                       {isAfterEndWeek && " (After end week)"}
//                     </SelectItem>
//                   );
//                 })}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* End Week */}
//           <div className="space-y-2">
//             <Label htmlFor="endWeek" className="font-normal text-base">
//               End Week
//             </Label>
//             <Select
//               value={formData.endWeek?.intervalName || ""}
//               onValueChange={(value) => {
//                 const selectedInterval = intervals.find(int => 
//                   mode === "add" ? int.endDate === value : int.label === value
//                 );
                
//                 if (selectedInterval) {
//                   const newEndWeek: WeekInterval = {
//                     intervalIndex: intervals.findIndex(i => i.endDate === selectedInterval.endDate),
//                     intervalName: selectedInterval.label,
//                     startDate: new Date(selectedInterval.startDate),
//                     endDate: new Date(selectedInterval.endDate)
//                   };
                  
//                   setFormData(prev => ({
//                     ...prev,
//                     endWeek: newEndWeek,
//                     startWeek: prev.startWeek && 
//                               new Date(newEndWeek.startDate) < new Date(prev.startWeek.startDate)
//                               ? newEndWeek
//                               : prev.startWeek
//                   }));
//                 }
//               }}
//             >
//               <SelectTrigger className="w-full p-2 bg-white border border-gray-300 rounded-lg">
//                 <SelectValue placeholder="Select week">
//                   {formData.endWeek 
//                     ? `${formData.endWeek.intervalName} (${formatDateRange(
//                         new Date(formData.endWeek.startDate).toISOString(),
//                         new Date(formData.endWeek.endDate).toISOString()
//                       )})`
//                     : "Select week"}
//                 </SelectValue>
//               </SelectTrigger>
//               <SelectContent>
//                 {intervals.map((interval) => {
//                   const displayLabel = `${interval.label} (${formatDateRange(
//                     interval.startDate,
//                     interval.endDate
//                   )})`;

//                   const isDisabled = shouldDisableWeek(interval);
//                   const isBeforeStartWeek = formData.startWeek && 
//                                           new Date(interval.startDate) < new Date(formData.startWeek.startDate);

//                   return (
//                     <SelectItem
//                       key={interval.endDate}
//                       value={mode === "add" ? interval.endDate : interval.label}
//                       disabled={isDisabled || isBeforeStartWeek}
//                       className="py-2 px-3"
//                     >
//                       {displayLabel}
//                       {isDisabled && !isBeforeStartWeek && " (Past week)"}
//                       {isBeforeStartWeek && " (Before start week)"}
//                     </SelectItem>
//                   );
//                 })}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Description */}
//           <div className="space-y-2 col-span-3">
//             <Label className="font-normal text-base">Description</Label>
//             <textarea
//               placeholder="Enter Description......"
//               value={formData.description}
//               onChange={(e) =>
//                 setFormData({ ...formData, description: e.target.value })
//               }
//               className="p-2 bg-white border border-gray-300 rounded-lg w-full h-24 resize-none"
//             />
//           </div>
//         </div>

//         {/* Dialog Footer */}
//         <DialogFooter>
//           <div className="flex justify-start w-full">
//             <Button
//               variant="outline"
//               className="w-[112px] h-[40px] text-sm"
//               onClick={() => onOpenChange(false)}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSubmit}
//               className={`w-[147px] h-[40px] ml-2 text-sm ${
//                 mode === "edit" ? "bg-black text-white hover:bg-gray-800" : ""
//               }`}
//             >
//               Save
//             </Button>
//           </div>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };



"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuarterService } from "@/services/quaterService";
import { getCurrentQuarter } from "../AddKPIDialog";
import { TeamService } from "@/services/teams";
import { useToast } from "@/hooks/use-toast";
import { Interval } from "@/types/kpi";
import { getIntervalLabels } from "../kpi/KpiConstant";
import { formatDateRange } from "./priorityConstant";
import { WeekInterval } from "@/types/priority";
import { useAuth } from "@/contexts/AuthContext";

interface PriorityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialData?: any;
  onSave?: (formData: any) => boolean | Promise<boolean>;
}

type PriorityType = "individual" | "team" | "company";

interface FormData {
  name: string;
  team: string;
  owner: string;
  quarter: string;
  startWeek: WeekInterval | null;
  endWeek: WeekInterval | null;
  description: string;
  type: PriorityType;
  quarterStartDate?: string;
  quarterEndDate?: string;
  status: 'Not yet started' | 'On track' | 'Behind schedule' | 'Complete' | 'Not applicable';
}

export const AddPriorityDialog = ({
  open,
  onOpenChange,
  mode,
  initialData,
  onSave
}: PriorityDialogProps) => {
  const { toast } = useToast();
  const [quarterResponse, setQuarterResponse] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [currentWeek, setCurrentWeek] = useState<Interval | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<any[]>([]);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [priority, setPriority] = useState("individual");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    team: "",
    owner: "",
    quarter: "",
    startWeek: null,
    endWeek: null,
    description: "",
    type: "individual",
    status: "Not yet started"
  });
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    team: "",
    owner: "",
    startWeek: "",
    endWeek: "",
  });
  const { user: userCheck } = useAuth();
  // console.log(userCheck?.isUserEdit);
  

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const transformedData = {
        ...initialData,
        team: initialData.team?._id || "",
        owner: initialData.owner?._id || "",
        startWeek: initialData.startWeek 
          ? { 
              ...initialData.startWeek,
              startDate: new Date(initialData.startWeek.startDate),
              endDate: new Date(initialData.startWeek.endDate)
            } 
          : null,
        endWeek: initialData.endWeek
          ? {
              ...initialData.endWeek,
              startDate: new Date(initialData.endWeek.startDate),
              endDate: new Date(initialData.endWeek.endDate)
            }
          : null
      };
      
      setFormData(transformedData);
      setPriority(initialData.type);
      
      if (initialData.team?._id) {
        const selectedTeam = teams.find(team => team._id === initialData.team._id);
        if (selectedTeam) {
          setSelectedTeamMembers(selectedTeam.memberIds);
        }
      }
    } else {
      setFormData({
        name: "",
        team: "",
        owner: "",
        quarter: "",
        startWeek: null,
        endWeek: null,
        description: "",
        status: "Not yet started",
        type: "individual",
      });
      setPriority("individual");
      setValidationErrors({
        name: "",
        team: "",
        owner: "",
        startWeek: "",
        endWeek: "",
      });
    }
  }, [mode, initialData, open, teams]);

  const fetchTeams = async () => {
    try {
      const response = await TeamService.getTeams();
      setTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        title: "Error",
        description: "Failed to fetch teams. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchQuarterData = useCallback(async () => {
    const quarter = formData.quarter || getCurrentQuarter();
    const match = quarter.match(/q(\d)-(\d{4})/);
    if (!match) {
      console.error("Invalid quarter format:", quarter);
      return;
    }

    const [, , yearStr] = match;

    try {
      const response: any = await QuarterService.getCurrentYearQuaters(yearStr);
      if (response.data) {
        setQuarterResponse(response.data);
        const today = new Date();
        let currentQuarter: string | null = null;
        let currentQuarterStartDate: string | null = null;
        let currentQuarterEndDate: string | null = null;
        for (let i = 0; i < response.data.length; i++) {
          const quarter = response.data[i];
          const quarterStart = new Date(quarter.start_date);
          const quarterEnd = new Date(quarter.end_date);

          if (today >= quarterStart && today <= quarterEnd) {
            currentQuarter = `${quarter.quarter}-${quarter.year}`;
            currentQuarterStartDate = quarter.start_date;
            currentQuarterEndDate = quarter.end_date;
            break;
          }
        }

        if (currentQuarter && mode === 'add') {
          setFormData((prevData: any) => ({
            ...prevData,
            quarter: currentQuarter,
            quarterStartDate: currentQuarterStartDate,
            quarterEndDate: currentQuarterEndDate,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching quarter data:", error);
    }
  }, [formData.quarter]);

  useEffect(() => {
    if (!open) return;
    const initialize = async () => {
      try {
        await fetchTeams();
        await fetchQuarterData();
      } finally {
      }
    };
    initialize();
  }, [open]);

  useEffect(() => {
    const fetchIntervals = async () => {
      if (formData.quarterStartDate && formData.quarterEndDate) {
        const calculatedIntervals = await getIntervalLabels(
          "weekly",
          formData.quarter,
          formData.quarterStartDate,
          formData.quarterEndDate
        );
        if (calculatedIntervals.length > 0) {
          setIntervals(calculatedIntervals);

          const today = new Date();
          const currentWeek = calculatedIntervals.find((interval) => {
            const startDate = new Date(interval.startDate);
            const endDate = new Date(interval.endDate);
            return today >= startDate && today <= endDate;
          });
          setCurrentWeek(currentWeek || null);
          if (currentWeek && mode === 'add') {
            const newStartWeek: WeekInterval = {
              intervalIndex: calculatedIntervals.findIndex(
                (i) => i.startDate === currentWeek.startDate
              ),
              intervalName: currentWeek.label,
              startDate: new Date(currentWeek.startDate),
              endDate: new Date(currentWeek.endDate),
            };
            setFormData((prevData) => ({
              ...prevData,
              startWeek: newStartWeek,
              endWeek: newStartWeek
            }))
          }
        }
      }
    };

    fetchIntervals();
  }, [formData.quarter, formData.quarterStartDate, formData.quarterEndDate]);

  const handleTeamChange = (teamId: string) => {
    const selectedTeam = teams.find((team) => team._id === teamId);
    if (selectedTeam) {
      setSelectedTeamMembers(selectedTeam.memberIds);
      setFormData({
        ...formData,
        team: teamId,
        owner: "",
      });
    }
  };

  const validateForm = useCallback(() => {
    const errors = {
      name: !formData.name ? "Priority name is required" : "",
      team: !formData.team && "Team is required",
      owner: !formData.owner && "Owner is required",
      startWeek: !formData.startWeek ? "Start week is required" : "",
      endWeek: !formData.endWeek ? "End week is required" : "",
    };

    if (formData.startWeek && currentWeek && mode === 'add' &&
      new Date(formData.startWeek.endDate) < new Date(currentWeek.startDate) &&
      !userCheck?.isUserEdit) {
      errors.startWeek = "Cannot select a week in the past";
    }

    setValidationErrors(errors);
    return Object.values(errors).every(error => !error);
  }, [formData, priority, currentWeek, userCheck]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      const result = await onSave(formData);
      if (result) {
        onOpenChange(false);
        setFormData({
          type: "individual",
          name: "",
          owner: "",
          team: "",
          quarter: "",
          startWeek: null,
          endWeek: null,
          description: "",
          status: "Not yet started",
          quarterStartDate: undefined,
          quarterEndDate: undefined,
        })
      }
    } catch (error) {
      console.error('Error creating priority:', error);
      toast({
        title: "Error",
        description: "Failed to create priority. Please try again.",
        variant: "destructive"
      });
    }
  };

  const shouldDisableWeek = (interval: Interval) => {
    const isPastWeek = new Date(interval.endDate) < new Date();
    
    // For both add and edit modes, check user permissions for past weeks
    if (isPastWeek) {
      return !userCheck?.isUserEdit; // Disable if user doesn't have edit permission
    }
    
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-6 bg-[#F5F5F5] rounded-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-normal bg-black text-white p-3 rounded-lg">
            {mode === "add" ? "Add Priority" : "Edit Priority"}
          </DialogTitle>
        </DialogHeader>

        {/* Priority Type Selection */}
        <div className="flex items-center space-x-8 p-2">
          {["individual", "team", "company"].map((priorityType) => (
            <label
              key={priorityType}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                value={priorityType}
                checked={priority === priorityType}
                onChange={() => {
                  if (mode === "add") {
                    setPriority(priorityType);
                    localStorage.setItem("priorityType", priorityType);
                  }
                }}
                disabled={mode === "edit"}
                className="peer hidden"
              />
              <div className="w-4 h-4 rounded-full border-2 border-black flex items-center justify-center peer-checked:before:block before:hidden before:w-2 before:h-2 before:bg-black before:rounded-full"></div>
              <span className="text-gray-700 capitalize">
                {priorityType} Priority
              </span>
            </label>
          ))}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-3 gap-6">
          {/* Priority Name */}
          <div className="space-y-2">
            <Label className="font-normal text-base">Priority Name</Label>
            <Input
              tabIndex={-1}
              id="name"
              value={formData.name}
              placeholder="Enter the Priority Name"
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setValidationErrors((prev) => ({ ...prev, name: "" }));
              }}
              className={`p-2 bg-white text-black autofill:bg-white autofill:text-black border ${
                validationErrors.name ? "border-red-500" : "border-gray-300"
              } rounded-lg`}
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm">{validationErrors.name}</p>
            )}
          </div>

          {/* Team Selection */}
          <div className="space-y-2">
            <Label htmlFor="team" className="font-normal text-base">
              Select Team
            </Label>
            <Select
              value={formData.team}
              onValueChange={handleTeamChange}
              disabled={mode === "edit" || teams.length === 0}
            >
              <SelectTrigger
                className={`w-full p-2 bg-white border ${
                  validationErrors.team ? "border-red-500" : "border-gray-300"
                } rounded-lg`}
              >
                <SelectValue
                  placeholder={
                    teams.length === 0 ? "No teams available" : "Select team"
                  }
                />
              </SelectTrigger>
              {teams.length > 0 ? (
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              ) : (
                <SelectContent>
                  <div className="py-2 px-3 text-gray-500 text-sm">
                    No teams available
                  </div>
                </SelectContent>
              )}
            </Select>
            {validationErrors.team && (
              <p className="text-red-500 text-sm">{validationErrors.team}</p>
            )}
          </div>

          {/* Owner Selection */}
          <div className="space-y-2">
            <Label htmlFor="owner" className="font-normal text-base">
              Select Owner
            </Label>
            <Select
              value={formData.owner}
              onValueChange={(value) => {
                const member = selectedTeamMembers.find((m) => m._id === value);
                if (member) {
                  setFormData({
                    ...formData,
                    owner: member._id,
                  });
                  setValidationErrors((prev) => ({ ...prev, owner: "" }));
                }
              }}
              disabled={mode === "edit"}
            >
              <SelectTrigger
                className={`w-full p-2 bg-white ${
                  validationErrors.owner ? "border-red-500" : "border-gray-300"
                } rounded-lg`}
              >
                <SelectValue
                  placeholder={
                    selectedTeamMembers.length === 0
                      ? formData.team
                        ? "No members in this team"
                        : "Select a team first"
                      : "Select owner"
                  }
                />
              </SelectTrigger>
              {selectedTeamMembers.length > 0 ? (
                <SelectContent>
                  {selectedTeamMembers.map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              ) : (
                <SelectContent>
                  <div className="py-2 px-3 text-gray-500 text-sm">
                    {formData.team
                      ? "No members in this team"
                      : "Please select a team first"}
                  </div>
                </SelectContent>
              )}
            </Select>
            {validationErrors.owner && (
              <p className="text-red-500 text-sm">{validationErrors.owner}</p>
            )}
          </div>
          
          {/* Quarter Selection */}
          <div className="space-y-2">
            <Label className="font-normal text-base">Quarter</Label>
            {mode === "add" ? (
              <Select
                value={formData.quarter}
                onValueChange={(value) => {
                  const selectedQuarter = quarterResponse.find(
                    (q) => `${q.quarter}-${q.year}` === value
                  );
                  if (selectedQuarter) {
                    setFormData({
                      ...formData,
                      quarter: value,
                      quarterStartDate: selectedQuarter.start_date,
                      quarterEndDate: selectedQuarter.end_date,
                      startWeek: null,
                      endWeek: null
                    });
                  }
                }}
              >
                <SelectTrigger className="w-full p-2 bg-white border border-gray-300 rounded-lg">
                  <SelectValue placeholder="Select quarter">
                    {formData.quarter
                      ? (() => {
                          const [q, y] = formData.quarter.split("-");
                          return `${q.toUpperCase()} ${y}`;
                        })()
                      : "Select quarter"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {quarterResponse.map((quarter) => {
                    const value = `${quarter.quarter}-${quarter.year}`;
                    const endDate = new Date(quarter.end_date);
                    const currentDate = new Date();
                    const isDisabled = endDate < currentDate;

                    return (
                      <SelectItem
                        key={value}
                        value={value}
                        disabled={isDisabled}
                      >
                        {`${quarter.quarter.toUpperCase()} ${quarter.year}`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="quarter"
                value={formData.quarter.toUpperCase().replace("-", " ")}
                disabled
                className="w-full p-2 bg-white border border-gray-300 rounded-lg"
              />
            )}
          </div>

          {/* Start Week */}
          <div className="space-y-2">
            <Label htmlFor="startWeek" className="font-normal text-base">
              Start Week
            </Label>
            <Select
              value={formData.startWeek?.intervalName || ""}
              onValueChange={(value) => {
                const selectedInterval = intervals.find(
                  (int) => int.label === value
                );

                if (selectedInterval) {
                  const newStartWeek: WeekInterval = {
                    intervalIndex: intervals.findIndex(
                      (i) => i.startDate === selectedInterval.startDate
                    ),
                    intervalName: selectedInterval.label,
                    startDate: new Date(selectedInterval.startDate),
                    endDate: new Date(selectedInterval.endDate),
                  };
                  setFormData((prev) => {
                    let newEndWeek = prev.endWeek;
                    if (
                      prev.endWeek &&
                      new Date(selectedInterval.startDate) >
                        new Date(prev.endWeek.startDate)
                    ) {
                      newEndWeek = newStartWeek;
                    }
                    return {
                      ...prev,
                      startWeek: newStartWeek,
                      endWeek: newEndWeek,
                    };
                  });
                }
              }}
            >
              <SelectTrigger className="w-full p-2 bg-white border border-gray-300 rounded-lg">
                <SelectValue
                  placeholder={
                    mode === "add"
                      ? "Select week"
                      : formData.startWeek?.intervalName || "Select week"
                  }
                >
                  {mode === "add"
                    ? formData.startWeek
                      ? `${formData.startWeek.intervalName} (${formatDateRange(
                          new Date(formData?.startWeek?.startDate).toISOString(),
                          new Date(formData.startWeek.endDate).toISOString()
                        )})`
                      : "Select week"
                    : formData.startWeek ? `${formData.startWeek.intervalName} (${formatDateRange(
                          new Date(formData?.startWeek?.startDate).toISOString(),
                          new Date(formData.startWeek.endDate).toISOString()
                        )})` : "Select week"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {intervals.map((interval) => {
                  const displayLabel = `${interval.label} (${formatDateRange(
                    interval.startDate,
                    interval.endDate
                  )})`;
                  
                  const isDisabled = shouldDisableWeek(interval);
                  const isAfterEndWeek = formData.endWeek
                    ? new Date(interval.startDate) > new Date(formData.endWeek.endDate)
                    : false;

                  return (
                    <SelectItem
                      key={interval.label}
                      value={interval.label}
                      disabled={isDisabled || isAfterEndWeek}
                      className="py-2 px-3"
                    >
                      {displayLabel}
                      {isDisabled && !isAfterEndWeek && " (Past week)"}
                      {isAfterEndWeek && " (After end week)"}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* End Week */}
          <div className="space-y-2">
            <Label htmlFor="endWeek" className="font-normal text-base">
              End Week
            </Label>
            <Select
              value={formData.endWeek?.intervalName || ""}
              onValueChange={(value) => {
                const selectedInterval = intervals.find(int => 
                  mode === "add" ? int.endDate === value : int.label === value
                );
                
                if (selectedInterval) {
                  const newEndWeek: WeekInterval = {
                    intervalIndex: intervals.findIndex(i => i.endDate === selectedInterval.endDate),
                    intervalName: selectedInterval.label,
                    startDate: new Date(selectedInterval.startDate),
                    endDate: new Date(selectedInterval.endDate)
                  };
                  
                  setFormData(prev => ({
                    ...prev,
                    endWeek: newEndWeek,
                    startWeek: prev.startWeek && 
                              new Date(newEndWeek.startDate) < new Date(prev.startWeek.startDate)
                              ? newEndWeek
                              : prev.startWeek
                  }));
                }
              }}
            >
              <SelectTrigger className="w-full p-2 bg-white border border-gray-300 rounded-lg">
                <SelectValue placeholder="Select week">
                  {formData.endWeek 
                    ? `${formData.endWeek.intervalName} (${formatDateRange(
                        new Date(formData.endWeek.startDate).toISOString(),
                        new Date(formData.endWeek.endDate).toISOString()
                      )})`
                    : "Select week"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {intervals.map((interval) => {
                  const displayLabel = `${interval.label} (${formatDateRange(
                    interval.startDate,
                    interval.endDate
                  )})`;

                  const isDisabled = shouldDisableWeek(interval);
                  const isBeforeStartWeek = formData.startWeek && 
                                          new Date(interval.startDate) < new Date(formData.startWeek.startDate);

                  return (
                    <SelectItem
                      key={interval.endDate}
                      value={mode === "add" ? interval.endDate : interval.label}
                      disabled={isDisabled || isBeforeStartWeek}
                      className="py-2 px-3"
                    >
                      {displayLabel}
                      {isDisabled && !isBeforeStartWeek && " (Past week)"}
                      {isBeforeStartWeek && " (Before start week)"}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2 col-span-3">
            <Label className="font-normal text-base">Description</Label>
            <textarea
              placeholder="Enter Description......"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="p-2 bg-white border border-gray-300 rounded-lg w-full h-24 resize-none"
            />
          </div>
        </div>

        {/* Dialog Footer */}
        <DialogFooter>
          <div className="flex justify-start w-full">
            <Button
              variant="outline"
              className="w-[112px] h-[40px] text-sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className={`w-[147px] h-[40px] ml-2 text-sm ${
                mode === "edit" ? "bg-black text-white hover:bg-gray-800" : ""
              }`}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

