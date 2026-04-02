// "use client";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { MultiSelect } from "@/components/MultiSelect";
// import { InfoIcon } from "lucide-react";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import type {
//   KpiFormData,
//   Option,
//   CompanyKpiFormData,
//   TeamKpiFormData,
// } from "@/types/kpi";
// import {
//   companyKpis,
//   measurementUnits,
//   teamKpis,
//   teams,
//   teamMembers,
//   teamToMembers,
// } from "@/data/KPIData";

// interface FormSectionProps {
//   formData: KpiFormData;
//   onFormChange: (field: string, value: any) => void; // Change to string to accept any property key
//   onTargetValueChange: (value: string) => void;
// }

// export function FormSection({
//   formData,
//   onFormChange,
//   onTargetValueChange,
// }: FormSectionProps) {
//   const { kpiType, inheritedFields = {} } = formData;

//   // Get team members based on selected team or KPI type
//   const getTeamMembers = (): Option[] => {
//     if (kpiType === "team" && (formData as TeamKpiFormData).teamId) {
//       return teamToMembers[(formData as TeamKpiFormData).teamId] || teamMembers;
//     } else if (
//       kpiType === "company" &&
//       (formData as CompanyKpiFormData).teamIds &&
//       (formData as CompanyKpiFormData).teamIds.length > 0
//     ) {
//       // For company KPIs, collect members from all selected teams
//       const allMembers = new Map<string, Option>();
//       (formData as CompanyKpiFormData).teamIds.forEach((team) => {
//         const members = teamToMembers[team.id] || [];
//         members.forEach((member) => {
//           allMembers.set(member.id, member);
//         });
//       });
//       return Array.from(allMembers.values());
//     }
//     return teamMembers;
//   };

//   // Get available team members for the current context
//   const availableMembers = getTeamMembers();

//   return (
//     // Rest of component remains the same, but all calls to onFormChange will now be valid
//     // because we're accepting any string as the field name
//     // Component implementation continues...
//     /* No changes needed in the JSX part */
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       <div className="space-y-2">
//         <Label htmlFor="kpi-name">KPI Name</Label>
//         <Input
//           id="kpi-name"
//           value={formData.name}
//           onChange={(e) => onFormChange("name", e.target.value)}
//         />
//       </div>

//       {kpiType === "individual" && (
//         <div className="space-y-2">
//           <Label htmlFor="link-with" className="flex items-center gap-1">
//             Link With Team KPI
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <InfoIcon className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p className="max-w-xs text-xs">
//                     Linking will inherit Measurement Unit, Division Type,
//                     Quarter and Frequency from the parent KPI
//                   </p>
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//           </Label>
//           <Select
//             value={formData.parentKpiId || "none"}
//             onValueChange={(value) =>
//               onFormChange("parentKpiId", value === "none" ? undefined : value)
//             }
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Select KPI (Optional)" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="none">None</SelectItem>
//               {teamKpis.map((kpi) => (
//                 <SelectItem key={kpi.id} value={kpi.id}>
//                   {kpi.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       )}

//       {kpiType === "team" && (
//         <div className="space-y-2">
//           <Label htmlFor="link-with" className="flex items-center gap-1">
//             Link With Company KPI
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <InfoIcon className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p className="max-w-xs text-xs">
//                     Linking will inherit Measurement Unit, Division Type,
//                     Quarter and Frequency from the parent KPI
//                   </p>
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//           </Label>
//           <Select
//             value={formData.parentKpiId || "none"}
//             onValueChange={(value) =>
//               onFormChange("parentKpiId", value === "none" ? undefined : value)
//             }
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Select KPI (Optional)" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="none">None</SelectItem>
//               {companyKpis.map((kpi) => (
//                 <SelectItem key={kpi.id} value={kpi.id}>
//                   {kpi.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       )}

//       {kpiType === "team" && (
//         <div className="space-y-2">
//           <Label htmlFor="select-team">Select Team</Label>
//           <Select
//             value={formData.teamId || teams[0].id}
//             onValueChange={(value) => {
//               // Update team and reset owner if needed
//               onFormChange("teamId", value);
//               // Check if current owner is in the team
//               const teamMemberIds = (teamToMembers[value] || []).map(
//                 (m) => m.id
//               );
//               if (!teamMemberIds.includes(formData.ownerId.id)) {
//                 const newOwner =
//                   (teamToMembers[value] || [])[0] || teamMembers[0];
//                 onFormChange("ownerId", newOwner);
//               }
//             }}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Select team" />
//             </SelectTrigger>
//             <SelectContent>
//               {teams.map((team) => (
//                 <SelectItem key={team.id} value={team.id}>
//                   {team.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       )}

//       {kpiType === "company" && (
//         <div className="space-y-2">
//           <Label htmlFor="select-team">Select Team</Label>
//           <MultiSelect
//             options={teams}
//             selected={(formData as CompanyKpiFormData).teamIds || []}
//             onChange={(selected) => {
//               if (formData.kpiType === "company") {
//                 onFormChange("teamIds", selected);
//                 // Check if current owner is in any of the selected teams
//                 const allMemberIds = new Set<string>();
//                 selected.forEach((team) => {
//                   (teamToMembers[team.id] || []).forEach((member) => {
//                     allMemberIds.add(member.id);
//                   });
//                 });
//                 if (!allMemberIds.has(formData.ownerId.id)) {
//                   // Set first member from first team as owner
//                   const firstTeamMembers =
//                     selected.length > 0
//                       ? teamToMembers[selected[0].id] || []
//                       : [];
//                   const newOwner = firstTeamMembers[0] || teamMembers[0];
//                   onFormChange("ownerId", newOwner);
//                 }
//               }
//             }}
//             placeholder="Select teams"
//             emptyMessage="No teams found"
//           />
//         </div>
//       )}

//       <div className="space-y-2">
//         <Label htmlFor="owner">Select Owner</Label>
//         <Select
//           value={formData.ownerId.id}
//           onValueChange={(value) => {
//             const ownerOption =
//               availableMembers.find((m) => m.id === value) ||
//               availableMembers[0];
//             onFormChange("ownerId", ownerOption);
//           }}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select owner" />
//           </SelectTrigger>
//           <SelectContent>
//             {availableMembers.map((member) => (
//               <SelectItem key={member.id} value={member.id}>
//                 {member.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {kpiType === "team" && (
//         <div className="space-y-2">
//           <Label htmlFor="assign-to">Assign to</Label>
//           <MultiSelect
//             options={getTeamMembers()}
//             selected={(formData as TeamKpiFormData).assigneeIds || []}
//             onChange={(selected) => {
//               if (formData.kpiType === "team") {
//                 onFormChange("assigneeIds", selected);
//               }
//             }}
//             placeholder="Select team members"
//             emptyMessage="No team members found"
//           />
//         </div>
//       )}

//       <div className="space-y-2">
//         <Label htmlFor="measurement-unit" className="flex items-center gap-1">
//           Measurement Unit
//           {inheritedFields.measurementUnit && (
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <InfoIcon className="h-3.5 w-3.5 text-blue-500 cursor-help" />
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p className="max-w-xs text-xs">Inherited from parent KPI</p>
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//           )}
//         </Label>
//         <Select
//           value={formData.measurementUnit}
//           onValueChange={(value) => onFormChange("measurementUnit", value)}
//           disabled={inheritedFields.measurementUnit}
//         >
//           <SelectTrigger
//             className={inheritedFields.measurementUnit ? "bg-blue-50" : ""}
//           >
//             <SelectValue placeholder="Select unit" />
//           </SelectTrigger>
//           <SelectContent>
//             {measurementUnits.map((unit) => (
//               <SelectItem key={unit.id} value={unit.id}>
//                 {unit.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="target-value">Target Value</Label>
//         <Input
//           id="target-value"
//           type="Number"
//           inputMode="decimal"
//           value={formData.targetValue}
//           onChange={(e) => onTargetValueChange(e.target.value)}
//           placeholder="Enter numeric value"
//         />
//       </div>

//       <div className="space-y-2">
//         <Label className="flex items-center gap-1">
//           DivisionType
//           {inheritedFields.divisionType && (
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <InfoIcon className="h-3.5 w-3.5 text-blue-500 cursor-help" />
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p className="max-w-xs text-xs">Inherited from parent KPI</p>
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//           )}
//         </Label>
//         <div
//           className={`border rounded-md p-3 ${
//             inheritedFields.divisionType ? "bg-blue-50" : ""
//           }`}
//         >
//           <RadioGroup
//             value={formData.divisionType}
//             onValueChange={(value) => onFormChange("divisionType", value)}
//             className="flex gap-6"
//             disabled={inheritedFields.divisionType}
//           >
//             <div className="flex items-center space-x-2">
//               <RadioGroupItem
//                 value="standalone"
//                 id="standalone"
//                 disabled={inheritedFields.divisionType}
//               />
//               <Label
//                 htmlFor="standalone"
//                 className={inheritedFields.divisionType ? "opacity-70" : ""}
//               >
//                 Standalone
//               </Label>
//             </div>
//             <div className="flex items-center space-x-2">
//               <RadioGroupItem
//                 value="cumulative"
//                 id="cumulative"
//                 disabled={inheritedFields.divisionType}
//               />
//               <Label
//                 htmlFor="cumulative"
//                 className={inheritedFields.divisionType ? "opacity-70" : ""}
//               >
//                 Cumulative
//               </Label>
//             </div>
//           </RadioGroup>
//         </div>
//       </div>
//     </div>
//   );
// }
