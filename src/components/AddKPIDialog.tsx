"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/MultiSelect";
import axiosInstance from "@/axios";
import { useToast } from "@/hooks/use-toast";
import AccessControl from "./AccessControl";
import { Permission } from "@/contexts/PermissionsContext";
import { useCallback, useEffect, useState } from "react";
import { QuarterService } from "@/services/quaterService";
import { TeamService } from "@/services/teams";
import {  Quarter } from "@/types/kpi";
import { CurrencySelector } from "./ui/CurrencyTypeSelect";
import { KpiService } from "@/services/kpis";

const BreakdownTable = React.lazy(() => import('./kpi/BreakdownTable'));
const mockMeasurementUnits = [
  { id: "number", name: "Number" },
  { id: "percentage", name: "Percentage" },
];

const mockFrequencies = [
  { id: "daily", name: "Daily" },
  { id: "weekly", name: "Weekly" },
  { id: "monthly", name: "Monthly" },
  { id: "quarterly", name: "Quarterly" },
];

export function getCurrentQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `q${quarter}-${year}`;
}



const getInitialFormData = (type: string) => ({
  kpiType: type,
  name: "",
  ownerId: { id: "", name: "" },
  measurementUnit: "number",
  targetValue: 0,
   currentValue:0,
  currencyType:"",
  divisionType: "cumulative",
  description: "",
  frequency: "weekly",
  remaingContribution: 0,
  quarter: "",
  quarterStartDate: null,
  quarterEndDate: null,
  breakdown: {},
  // parentBreakdown: [],
  parentKpiId: "",
  initialTargetValue:0,
  initialCurrentValue:0
});

interface AddKpiDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: any;
  isEditMode?: boolean;
  kpiType?: string;
  defaultKpiType?: "individual" | "team" | "company";
  onSave?: (formData: any) => boolean | Promise<boolean>;
}

export function AddKpiDialog({
  open,
  onOpenChange,
  initialData,
  isEditMode = false,
  kpiType = "individual",
  defaultKpiType = "individual",
  onSave,
}: AddKpiDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const [formData, setFormData] = useState<any>(
    initialData || getInitialFormData(defaultKpiType)
  );
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] =
    useState(isEditMode);
  const [, setHasValidationErrors] = useState(false);
  const [resetBreakdownKey, _setResetBreakdownKey] = useState(0);
  const [newBreakdown, setNewBreakdown] = useState<any>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
    const [showWarning, setShowWarning] = useState(false);
    const [seleteedParentId,setSelectedParentId]=useState<string>()
  const [remainingContribution, setRemainingContribution] = useState(0);
  const [quarterResponse, setQuarterResponse] = useState<Quarter[]>([]);
  // const [parentBreakdown, setParentBreakdown] = useState<IntervalBreakdown[]>([]);
  const [assign, setAssign] = useState<any[]>([]);
  const [teamData, setTeamData] = useState<any[]>([]);
    const [teams, setTeams] = React.useState<any[]>([]);
    const [_teamMembers, setTeamMembers] = React.useState<any[]>([]);
    const [allUsers, setAllUsers] = React.useState<any[]>([]);
    const [kpis, setKpis] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
  // const [isTargetValueInherited, setIsTargetValueInherited] =
  //   React.useState(false);

  useEffect(() => {
    if (isEditMode && initialData.breakdownData) {
      setNewBreakdown(initialData.breakdownData);
    }
  }, [initialData]);

  useEffect(()=>{
    if(formData?.targetValue && !isEditMode){
        const currentTargetValue=formData.targetValue - formData.currentValue
        handleFormChange('initialTargetValue', currentTargetValue)
        handleFormChange('initialCurrentValue',formData.currentValue)
    }else if(isEditMode){
      const currentTargetValue=formData.targetValue-formData.initialCurrentValue
      handleFormChange('initialTargetValue',currentTargetValue)
      
    }
  },[formData.targetValue,formData.currentValue,formData.initialCurrentValue])

  // Handle dialog state from props or local state
  const isOpen = open !== undefined ? open : localOpen;
  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setLocalOpen(value);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    } else {
      setIsSubmitting(false);
      setValidationErrors({});
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch teams
      const teamsResponse: any = await TeamService.getTeams();
      setTeams(teamsResponse.data);

      // Extract all team members from teams
      const allMembers: any[] = [];
      teamsResponse.data.forEach((team: any) => {
        team.memberIds.forEach((member: any) => {
          if (!allMembers.some((m) => m._id === member._id)) {
            allMembers.push(member);
          }
        });
      });
      setTeamMembers(allMembers);

      // Fetch all users
      const usersResponse = await axiosInstance.get("/users");
      setAllUsers(usersResponse.data);

      await fetchQuarterData();
     
      // Fetch KPIs
     await fetchNextKpiLevel
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNextKpiLevel = useCallback(async (currentKpiType: string) => {
    let fetchKpiType;
  
    if (currentKpiType === "individual") {
      fetchKpiType = "team";
    } else if (currentKpiType === "team") {
      fetchKpiType = "company";
    } else {
      console.warn("Unsupported KPI type:", currentKpiType);
      setKpis([]);
      return;
    }
    try {
      // const response = await KpiService.findAllByType({
      //   kpiType: fetchKpiType,
      // });
       let response
      if(!isEditMode){
       response = await KpiService.findAllByType({
        kpiType: fetchKpiType,
      });
    }else {
      //   response = await axiosInstance.get(
      //   `/kpis/${initialData._id}/matching-parent-kpis`
      // );
      const inputForm = initialData.parentKpiId ? true : false;

      response = await axiosInstance.get(
        `/kpis/${initialData._id}/matching-parent-kpis/inputForm=${inputForm}`
      );
    }
      setKpis(response.data || []);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      setKpis([]);
    }
  }, []);
  
  useEffect(() => {
    if (formData.kpiType) {
      fetchNextKpiLevel(formData.kpiType);
    }
  }, [formData.kpiType, fetchNextKpiLevel]);
  
  
  const fetchQuarterData = useCallback(async () => {
    if(!isEditMode){
    const quarter = formData.quarter || getCurrentQuarter();
    const match = quarter.match(/q(\d)-(\d{4})/);
    if (!match) {
      console.error("Invalid quarter format:", quarter);
      return;
    }

    const [_, quarterNumStr, yearStr] = match;
    console.log(quarterNumStr);
    try {
      const response: any = await QuarterService.getCurrentYearQuaters(yearStr);
      if (response.data) {
        setQuarterResponse(response.data);
        const today = new Date()
        const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        let currentQuarter: string | null = null;
        let currentQuarterStartDate: string | null = null;
        let currentQuarterEndDate: string | null = null;
        for (let i = 0; i < response.data.length; i++) {
          const quarter = response.data[i];
          const quarterStart = new Date(quarter.start_date);
          const quarterEnd = new Date(quarter.end_date);

          if (now >= quarterStart && now <= quarterEnd) {
            currentQuarter = `${quarter.quarter}-${quarter.year}`;
            currentQuarterStartDate = quarter.start_date;
            currentQuarterEndDate = quarter.end_date;
            break;
          }
        }
        if (currentQuarter) {
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
  }
  }, [formData.quarter]);

  async function fetchParentKpiData(kpiId: string) {
    try {
      const response = await axiosInstance.get(`/kpis/${kpiId}`);
      const parentKpi = response.data;
      setAssign(parentKpi.assigneeIds || []);
      setTeamData(parentKpi.teamIds || []);

      setFormData((prev: any) => ({
        ...prev,
        measurementUnit: parentKpi.measurementUnit,
        divisionType: parentKpi.divisionType,
        quarter: parentKpi.quarter,
        frequency: parentKpi.frequency,
      ...(parentKpi.divisionType == 'standalone' && {
    targetValue: parentKpi.targetValue,
  }),
        quarterStartDate:parentKpi.quarterStartDate,
        quarterEndDate:parentKpi.quarterEndDate,
          currencyType:parentKpi.currencyType
      }));
      return parentKpi;
    } catch (error) {
      console.error("Error fetching parent KPI data:", error);
      return null;
    }
  }

  useEffect(() => {
    if (isOpen && initialData) {
      const processedData = { ...initialData };
      if (processedData.targetValue) {
        const floatValue = Number.parseFloat(processedData.targetValue);
        processedData.targetValue = Math.round(floatValue);
      }
      setFormData(processedData);
      setShowAdditionalInfo(isEditMode);
    } else if (isOpen && !initialData) {
      setFormData(getInitialFormData(defaultKpiType));
      setShowAdditionalInfo(false);
    }
  }, [isOpen, initialData, isEditMode, defaultKpiType]);

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));

    setValidationErrors((prevErrors) => {
      const { [field]: _, ...rest } = prevErrors;
      return rest;
    });
  };

  const handleTargetValueChange = (value: Number) => {
    const numericValue = value;

    let roundedValue = numericValue;

    const numberValue = Number(roundedValue);

    if (numberValue > 1000000000) return;

    setFormData((prev: any) => ({
      ...prev,
      targetValue: roundedValue,
    }));

    setValidationErrors((prevErrors) => {
      const { targetValue, ...rest } = prevErrors;
      return rest;
    });
  };

  // Handle KPI name change for team/company KPIs
    const handleKpiTypeChange =useCallback((value: string) => {
    const newFormData:any = getInitialFormData(value);
    const today = new Date();
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  let currentQuarter: string | null = null;
  let currentQuarterStartDate: string | null = null;
  let currentQuarterEndDate: string | null = null;
  
  for (let i = 0; i < quarterResponse.length; i++) {
    const quarter = quarterResponse[i];
    const quarterStart = new Date(quarter.start_date);
    const quarterEnd = new Date(quarter.end_date);

    if (now >= quarterStart && now <= quarterEnd) {
      currentQuarter = `${quarter.quarter}-${quarter.year}`;
      currentQuarterStartDate = quarter.start_date;
      currentQuarterEndDate = quarter.end_date;
      break;
    }
  }
  if (currentQuarter) {
    newFormData.quarter = currentQuarter;
    newFormData.quarterStartDate = currentQuarterStartDate;
    newFormData.quarterEndDate = currentQuarterEndDate;
  }
  
  setFormData(newFormData)
  }, [quarterResponse]);
  
  const handleKpiNameChange = (id: string, value: string) => {
    if (formData.kpiType === "team" || formData.kpiType === "company") {
      setFormData((prev: any) => ({
        ...prev,
        breakdown: {
          ...prev.breakdown,
          [id]: value,
        },
      }));
    }
  };

  // Handle breakdown value change
  const handleBreakdownValueChange = (
    itemId: string,
    intervalIndex: number,
    value: string
  ) => {
    const itemKey = `${itemId}-interval${intervalIndex}`;
    setFormData((prev: any) => ({
      ...prev,
      breakdown: {
        ...prev.breakdown,
        [itemKey]: value,
      },
    }));
  };

  // Get breakdown items for the table
  const getBreakdownItems = () => {
    if (formData.kpiType === "individual") {
      const weeks: Record<string, string> = {};

      if (formData.breakdownData) {
        Object.entries(formData.breakdownData).forEach(([key, value]) => {
          const intervalKey = `interval${key.replace(
            `${formData.ownerId.id}-interval`,
            ""
          )}`;
          weeks[intervalKey] =
            (value as any)?.intervalTarget?.toString?.() || "0";
        });
      }

      return [
        {
          id: formData.ownerId.id,
          name: formData.ownerId.name,
          kpiName: (isEditMode && formData.breakdownData?.[0]?.kpiName) || "",
          contribution: "100",
          intervalBreakDown: formData.breakdownData,
          weeks,
        },
      ];
    } else if (formData.kpiType === "team") {
      // Find the selected team
      const selectedTeam = teams.find(
        (team) => team._id === formData.teamId?.id
      );

      if (!selectedTeam) return [];

      // Get assignees (members) from the selected team or from formData.assigneeIds
      const assigneeIds = formData.assigneeIds || [];
      const contributionValue =
        assigneeIds.length > 0 ? (100 / assigneeIds.length).toFixed(0) : 0;

      return assigneeIds.map((user: any) => {
        const childKpi = formData.childKpis?.find(
          (kpi: any) => kpi.ownerId.id === user.id
        );

        const weeks: Record<string, string> = {};
        if (childKpi && childKpi.breakdownData) {
          Object.entries(childKpi.breakdownData).forEach(([key, value]) => {
            const intervalKey = `interval${key.replace(
              `${formData.ownerId.id}-interval`,
              ""
            )}`;
            weeks[intervalKey] =
              (value as any)?.intervalTarget?.toString?.() || "0";
          });
        }

        return {
          id: user.id,
          name: user.name,
          kpiId: childKpi?._id,
          kpiName: childKpi?.name || formData.breakdown?.[user.id] || "",
          contribution: contributionValue,
          intervalBreakDown: childKpi?.breakdownData || [],
          weeks,
        };
      });
    } else if (formData.kpiType === "company") {
      const teamIds = formData.teamIds || [];
      const contributionValue =
        teamIds.length > 0 ? (100 / teamIds.length).toFixed(2) : 0;

      return teamIds.map((team: any) => {
        const weeks: Record<string, string> = {};

        // Find the corresponding child KPI for this team
        const childKpi = formData.childKpis?.find(
          (kpi: any) => kpi.teamId.id === team.id
        );

        // Get breakdown data from child KPI
        if (childKpi?.breakdownData) {
          childKpi.breakdownData.forEach((interval: any) => {
            const weekKey = `interval${interval.intervalIndex}`;
            weeks[weekKey] = interval.intervalTarget || "0";
          });
        }

        return {
          id: team.id,
          name: team.name,
          kpiId: childKpi?._id,
          kpiName: childKpi?.name || formData.breakdown?.[team.id] || "",
          contribution: contributionValue,
          intervalBreakDown: childKpi?.breakdownData || [],
          weeks,
        };
      });
    }
    return [];
  };

  const getAvailableOwners = () => {
    if (formData.kpiType === "individual") {
      return allUsers;
    } else if (formData.kpiType === "team") {
      const selectedTeam = teams.find((team) => team._id === formData.teamId);
      if (selectedTeam) {
        const existingOwner =
          formData.ownerId && formData.ownerId.id
            ? {
                _id: formData.ownerId.id,
                name: formData.ownerId.name,
              }
            : null;

        if (existingOwner) {
          return [existingOwner];
        } else if (selectedTeam.owner) {
          return [selectedTeam.owner];
        }
      }
      return allUsers; // Show all users if no team selected or no owner found
    } else if (formData.kpiType === "company") {
      if (!formData.teamIds || formData.teamIds.length === 0) {
        return allUsers; // Show all users if no teams selected
      }

      const selectedTeamIds = formData.teamIds.map((team: any) => team.id);
      const selectedTeams = teams.filter((team) =>
        selectedTeamIds.includes(team._id)
      );

      const owners: any[] = [];
      selectedTeams.forEach((team) => {
        if (team.owner && !owners.some((o) => o._id === team.owner._id)) {
          owners.push(team.owner);
        }
      });

      return owners.length > 0 ? owners : allUsers; // Fall back to all users if no owners found
    }

    return allUsers; // Default to showing all users
  };

  const validateForm = useCallback(() => {
    // debugger
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "KPI Name is required";
    }
    
    if (Number(formData.targetValue) === Number(formData.initialCurrentValue)) {
      if(isEditMode){
        errors.initialCurrentValue = "Initial current value cannot be equal to target value";
      }else{
        errors.currentValue = "current value cannot be equal to target value";
      }
    }
    if (!formData.targetValue) {
      errors.targetValue = "Target Value is required";
    } else if (isNaN(Number.parseFloat(formData.targetValue))) {
      errors.targetValue = "Target Value must be a number";
    } else if (Number.parseFloat(formData.targetValue) === 0) {
      errors.targetValue = "Target Value can't be zero";
    }

    if (formData.targetValue && formData.currentValue) {
    // if (Number(formData.currentValue) > Number(formData.targetValue)) {
    //   errors.currentValue = "Current value cannot exceed target value";
    // }
    }

    if (formData.kpiType === "individual") {
      if (!formData.ownerId || !formData.ownerId.id) {
        errors.ownerId = "Owner selection is required for Individual KPIs";
      } else {
        const isOwnerAssigned =
          assign &&
          assign.length > 0 &&
          assign.some((assignItem) => assignItem.id === formData.ownerId.id);
        if (isOwnerAssigned) {
          errors.ownerId =
            "Select another owner because the owner is already assigned to another KPI";
        }
      }
    } else if (formData.kpiType === "team") {
      if (!formData.teamId) {
        errors.teamId = "Team selection is required ";
      } else {
        const isTeamAssigned =
          teamData &&
          teamData.length > 0 &&
          teamData.some((teamItem) => teamItem.id === formData.teamId);
        if (isTeamAssigned) {
          errors.teamId =
            "Select another team because the team is already assigned to another KPI";
        }
      }

      if (!formData.ownerId || !formData.ownerId.id) {
        errors.ownerId = "Owner selection is required ";
      }

      if (!formData.assigneeIds || formData.assigneeIds.length === 0) {
        errors.assigneeIds = "At least one assignee is required ";
      }
    } else if (formData.kpiType === "company") {
      if (!formData.teamIds || formData.teamIds.length === 0) {
        errors.teamIds = "At least one team selection is required ";
      }

      if (!formData.ownerId || !formData.ownerId.id) {
        errors.ownerId = "Owner selection is required ";
      }
    }

    return errors;
  }, [formData, assign, teamData]);

  const prepareFormDataForSubmission = () => {
    // console.log(formData.breakdownData);
    
    // debugger
    const preparedData = { ...formData };

    if (preparedData.targetValue) {
      const floatValue = Number.parseFloat(preparedData.targetValue);
      preparedData.targetValue = Math.round(floatValue);
    }

      preparedData.remainingContribution = remainingContribution.toFixed(0);
    

    if (!preparedData.breakdown) {
      preparedData.breakdown = {};
    }

    if (formData.kpiType === "team" && formData.assigneeIds) {
      formData.assigneeIds.forEach((user: any) => {
        if (user.name && !preparedData.breakdown[user.id]) {
          preparedData.breakdown[user.id] = "";
        }
      });
    } else if (formData.kpiType === "company" && formData.teamIds) {
      formData.teamIds.forEach((team: any) => {
        if (team.name && !preparedData.breakdown[team.id]) {
          preparedData.breakdown[team.id] = "";
        }
      });
    }

    let updatedBreakdownData;
    if (formData.kpiType === "team" || formData.kpiType === "company") {
      if (!isEditMode) {
        preparedData.contribution = "100";
      }
      preparedData.childKpis = newBreakdown;
    } else {
      updatedBreakdownData = newBreakdown[0].intervalBreakDown;
      preparedData.contribution = newBreakdown[0].contribution;
    }

    const newPreparedData = {
      ...preparedData,
      breakdownData: updatedBreakdownData,
    };

    return newPreparedData;
  };

  const breakdownTableRef = React.useRef<any>(null);

  // Handle form submission
  const handleSubmit = async () => {
    // debugger
    setIsSubmitting(true);
    setValidationErrors({});

     const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: Object.values(errors).join("\n"),
      });
      setIsSubmitting(false);
      return;
    }

    if (
      breakdownTableRef.current &&
      breakdownTableRef.current.validateKpiNames
    ) {
      const hasKpiNameErrors = breakdownTableRef.current.validateKpiNames(true);

      if (hasKpiNameErrors) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description:
            "Please enter valid KPI names (at least 3 characters) for all items in the breakdown table",
        });
        return;
      }
    }
    if (breakdownTableRef.current && breakdownTableRef.current.hasExcessError) {
      const hasExcessError = breakdownTableRef.current.hasExcessError(true);

      if (hasExcessError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description:
            "The target has been exceeded. Please review and make the necessary adjustments.",
        });
        return;
      }
    }

    const preparedData = prepareFormDataForSubmission();
    if (onSave) {
      const result = await onSave(preparedData);
      if (result) {
        setOpen(false);
        if (!isEditMode) {
          setFormData(getInitialFormData(defaultKpiType));
          setShowAdditionalInfo(false);
        }
      }
    } else {
      setOpen(false);
      if (!isEditMode) {
        setFormData(getInitialFormData(defaultKpiType));
        setShowAdditionalInfo(false);
      }
    }
  };

  const isFieldDisabled = (fieldName: string) => {
    if (
      fieldName === "assigneeIds" &&
      (!formData.teamId || formData.teamId === "")
    ) {
      return true;
    }

    if (fieldName === "ownerId" && isEditMode) {
      if (kpiType === "team") {
        return true;
      }
      return true;
    }
    if (fieldName === "ownerId" && formData.teamId) {
      return true;
    }
    // Disable parentKpiId in edit mode
    if (fieldName === "parentKpiId" && isEditMode  && formData.parentKpiId) {
      return true;
    }

    if (isEditMode) {
      // In add mode, disable fields if parent KPI is selected
      if (formData.parentKpiId && ["targetValue",'initialCurrentValue'].includes(fieldName)) {
        return true;
      }
     
      return false;
    }

    if (!isEditMode) {
      if (
        formData.parentKpiId &&
        ["measurementUnit", "divisionType", "quarter", "frequency"].includes(
          fieldName
        )
      ) {
        return true;
      }
      // Disable targetValue if inherited from parent KPI
      if (
        fieldName === "targetValue" && isEditMode &&
        // isTargetValueInherited &&
        formData.divisionType === "standalone"
      ) {
        return true;
      }
      return false;
    }

    // Always editable fields
    const alwaysEditableFields = ["name", "description"];
    if (alwaysEditableFields.includes(fieldName)) return false;

    if (kpiType === "individual") {
      return !["name", "description"].includes(fieldName);
    } else if (kpiType === "team") {
      return !["name", "description", "teamId", "assigneeIds"].includes(
        fieldName
      );
    } else if (kpiType === "company") {
      return !["name", "description", "teamIds"].includes(fieldName);
    }

    return true; // Default to disabled in edit mode
  };

  const handleValidationChange = (hasError: boolean) => {
    setHasValidationErrors(hasError);
  };

  const dialogTitle = isEditMode
    ? `Edit ${kpiType.charAt(0).toUpperCase() + kpiType.slice(1)} KPI`
    : "Add KPIs";

  const availableOwners = getAvailableOwners();

  const handleIntervalChange = (value: string) => {
    const selectedTeam = teams.find((team) => team._id === value);

    handleFormChange("teamId", {
      id: selectedTeam._id,
      name: selectedTeam.name,
    });

    if (selectedTeam && selectedTeam.owner) {
      handleFormChange("ownerId", {
        id: selectedTeam.owner._id,
        name: selectedTeam.owner.name,
      });
    }
    handleFormChange("assigneeIds", []);
  };
 
const handleSaveChanges=()=>{
    setShowWarning(false)
     handleFormChange("parentKpiId", seleteedParentId);
                        if (seleteedParentId === undefined) {
                          setTeamData([]);
                          setValidationErrors((prevErrors) => {
                            const { teamId, ...rest } = prevErrors; // Remove only `ownerId`
                            return rest;
                          });
                        }

                        if (seleteedParentId) {
                          fetchParentKpiData(seleteedParentId);
                        }   
}

  return (
    <div>
    <Dialog open={isOpen} onOpenChange={setOpen} modal={true}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden bg-white">
        <div className="bg-black text-white p-4">
          <DialogTitle className="text-xl font-semibold">
            {dialogTitle}
          </DialogTitle>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <RadioGroup
                value={formData.kpiType}
                onValueChange={handleKpiTypeChange}
                className="flex gap-6"
                disabled={isEditMode}
              >
                <div className="flex items-center space-x-2">
                  <AccessControl
                    requiredPermissions={[
                      Permission.CREATE_INDIVIDUAL_KPI,
                      Permission.EDIT_INDIVIDUAL_KPI,
                    ]}
                  >
                    <RadioGroupItem
                      value="individual"
                      id="individual"
                      disabled={isEditMode}
                    />
                    <Label
                      htmlFor="individual"
                      className={isEditMode ? "opacity-70" : ""}
                    >
                      Individual KPIs
                    </Label>
                  </AccessControl>
                </div>
                <div className="flex items-center space-x-2">
                  <AccessControl
                    requiredPermissions={[
                      Permission.CREATE_TEAM_KPI,
                      Permission.EDIT_TEAM_KPI,
                    ]}
                  >
                    <RadioGroupItem
                      value="team"
                      id="team"
                      disabled={isEditMode}
                    />
                    <Label
                      htmlFor="team"
                      className={isEditMode ? "opacity-70" : ""}
                    >
                      Team KPIs
                    </Label>
                  </AccessControl>
                </div>
                <div className="flex items-center space-x-2">
                  <AccessControl
                    requiredPermissions={[
                      Permission.CREATE_ALL_KPI,
                      Permission.EDIT_ALL_KPI,
                    ]}
                  >
                    <RadioGroupItem
                      value="company"
                      id="company"
                      disabled={isEditMode}
                    />
                    <Label
                      htmlFor="company"
                      className={isEditMode ? "opacity-70" : ""}
                    >
                      Company KPIs
                    </Label>
                  </AccessControl>
                </div>
              </RadioGroup>

              {/* Form Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="kpi-name">KPI Name{!formData?.name && <span className="text-red-500">*</span>}</Label>
                  <Input
                    id="kpi-name"
                    placeholder="Enter KPI Name"
                    value={formData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className={validationErrors.name ? "border-red-500" : ""}
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                {formData.kpiType === "individual" && (
                  <div className="space-y-2 ">
                    <Label htmlFor="link-with">Link With Team KPI</Label>
                    <Select
                      value={formData.parentKpiId || "none"}
                      onValueChange={(value) => {
                        const parentId = value === "none" ? undefined : value;
                          setShowWarning(true)
                        setSelectedParentId(parentId)
                        // handleFormChange("parentKpiId", parentId);
                        // if (parentId === undefined) {
                        //   setAssign([]);
                        //   setValidationErrors((prevErrors) => {
                        //     const { ownerId, ...rest } = prevErrors; // Remove only `ownerId`
                        //     return rest;
                        //   });
                        // }
                        // // Set isTargetValueInherited to true if parentId is set
                        // if (parentId || parentId !== undefined) {
                        //   fetchParentKpiData(parentId);
                        //   setIsTargetValueInherited(true); // Mark targetValue as inherited
                        // } else {
                        //   setIsTargetValueInherited(false); // Reset when "None" is selected
                        // }
                        // if (parentId) {
                        //   fetchParentKpiData(parentId);
                        // }
                      }}
                      disabled={isFieldDisabled("parentKpiId")}
                    >
                      <SelectTrigger
                        className={`w-full ${
                          validationErrors.parentKpiId ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select KPI (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {kpis
                          .filter((kpi) => kpi.kpiType === "team")
                          .map((kpi) => (
                            <SelectItem key={kpi._id} value={kpi._id}>
                              {kpi.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.parentKpiId && (
                      <p className="text-red-500 text-sm">
                        {validationErrors.parentKpiId}
                      </p>
                    )}
                  </div>
                )}

                {formData.kpiType === "team" && (
                  <div className="space-y-2">
                    <Label htmlFor="select-team">Select Team{!formData?.teamId?.id && <span className="text-red-500">*</span>}</Label>
                    <Select
                      value={formData.teamId?.id || ""}
                      onValueChange={handleIntervalChange}
                      disabled={isEditMode || isFieldDisabled("teamId")}
                    >
                      <SelectTrigger
                        className={`w-full ${
                          validationErrors.teamId ? "border-red-500" : ""
                        }`}
                        onClick={(e) => {
                          if (teams.length === 0) {
                            e.preventDefault(); // Prevent dropdown from opening
                            toast({
                              variant: "destructive",
                              title: "No Teams Found",
                              description:
                                "Please create a team first before adding a Team KPI.",
                            });
                          }
                        }}
                      >
                        <SelectValue placeholder="Select team">
                          {formData.teamId?.name || "Select team"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {teams.length === 0 ? (
                          <SelectItem value="no-teams" disabled>
                            No teams available. Please create a team first.
                          </SelectItem>
                        ) : (
                          teams.map((team) => (
                            <SelectItem key={team._id} value={team._id}>
                              {team.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {validationErrors.teamId && (
                      <p className="text-red-500 text-sm">
                        {validationErrors.teamId}
                      </p>
                    )}
                  </div>
                )}

                {formData.kpiType === "team" && (
                  <div className="space-y-2">
                    <Label htmlFor="link-with-company">
                      Link With Company KPI
                    </Label>
                    <Select
                      value={formData.parentKpiId || "none"}
                      onValueChange={(value) => {
                        const parentId = value === "none" ? undefined : value;
                        setShowWarning(true)
                        setSelectedParentId(parentId)
                        // handleFormChange("parentKpiId", parentId);
                        // if (parentId === undefined) {
                        //   setTeamData([]);
                        //   setValidationErrors((prevErrors) => {
                        //     const { teamId, ...rest } = prevErrors; // Remove only `ownerId`
                        //     return rest;
                        //   });
                        // }
                        // if (parentId) {
                        //   fetchParentKpiData(parentId);
                        // }
                      }}
                      disabled={isFieldDisabled("parentKpiId")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select KPI (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {kpis
                          .filter((kpi) => kpi.kpiType === "company")
                          .map((kpi) => (
                            <SelectItem key={kpi._id} value={kpi._id}>
                              {kpi.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                

                <div className="space-y-2">
                  <Label htmlFor="owner">Select Owner{!formData?.ownerId?.id && <span className="text-red-500">*</span>}</Label>
                  <Select
                    value={formData.ownerId?.id || ""}
                    onValueChange={(value) => {
                      if (formData.kpiType === "individual") {
                        const ownerOption = allUsers.find(
                          (user) => user._id === value
                        );
                        if (ownerOption) {
                          handleFormChange("ownerId", {
                            id: ownerOption._id,
                            name: ownerOption.name,
                          });
                        }
                      } else {
                        const availableOwnersList = getAvailableOwners();
                        const ownerOption = availableOwnersList.find(
                          (m) => m._id === value
                        );
                        if (ownerOption) {
                          handleFormChange("ownerId", {
                            id: ownerOption._id,
                            name: ownerOption.name,
                          });
                        }
                      }
                    }}
                    disabled={isFieldDisabled("ownerId")}
                  >
                    <SelectTrigger
                      className={`w-full ${
                        validationErrors.ownerId ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select owner">
                        {formData.ownerId?.name || "Select owner"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {formData.kpiType === "individual"
                        ? allUsers.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.name}
                            </SelectItem>
                          ))
                        : availableOwners.map((member) => (
                            <SelectItem key={member._id} value={member._id}>
                              {member.name}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.ownerId && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.ownerId}
                    </p>
                  )}
                </div>
                {formData.kpiType === "company" && (
                  <div className="space-y-2">
                    <Label htmlFor="select-team">Select Team{!formData?.teamIds && <span className="text-red-500">*</span>}</Label>
                    <MultiSelect
                      options={teams
                        .filter((team) => {
                          if (!formData.ownerId?.id) return false;
                          return team.owner?.id === formData.ownerId.id;
                        })
                        .map((team) => ({
                          id: team._id,
                          name: team.name,
                        }))}
                      selected={formData.teamIds || []}
                      onChange={(selected) => {
                        // Store the current owner before updating teams
                        const currentOwner = formData.ownerId;

                        // Update teams
                        handleFormChange("teamIds", selected);

                        // Immediately restore owner to ensure UI updates
                        if (currentOwner) {
                          handleFormChange("ownerId", {
                            id: currentOwner.id,
                            name: currentOwner.name,
                          });
                        }
                      }}
                      placeholder={
                        formData.ownerId?.id
                          ? "Select teams"
                          : "Please select owner first"
                      }
                      emptyMessage={
                        formData.ownerId?.id
                          ? "No teams found"
                          : "Please select owner first"
                      }
                      className={`w-full ${
                          validationErrors.teamIds ? "border-red-500 " : ""
                        }`}
                      disabled={
                        isFieldDisabled("teamIds") || !formData.ownerId?.id
                      }
                    />
                     {validationErrors.teamIds && (
                      <p className="text-red-500 text-sm">
                        {validationErrors.teamIds}
                      </p>
                    )}
                  </div>
                )}

                {formData.kpiType === "team" && (
                  <div className="space-y-2">
                    <Label htmlFor="assign-to">Assign to{!formData?.assigneeIds && <span className="text-red-500">*</span>}</Label>
                    <MultiSelect
                      options={
                        teams
                          .find((team) => team._id === formData.teamId?.id)
                          ?.memberIds.map((member: any) => ({
                            id: member._id,
                            name: member.name,
                          })) || []
                      }
                      selected={formData.assigneeIds || []}
                      onChange={(selected) =>
                        handleFormChange("assigneeIds", selected)
                      }
                      placeholder="Select team members"
                      emptyMessage="No team members found"
                      disabled={isFieldDisabled("assigneeIds")}
                      className={
                        validationErrors.assigneeIds ? "border-red-500" : ""
                      }
                    />
                    {validationErrors.assigneeIds && (
                      <p className="text-red-500 text-sm">
                        {validationErrors.assigneeIds}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="measurement-unit">Measurement Unit</Label>
                  <Select
                    value={formData.measurementUnit}
                    onValueChange={(value) =>
                      handleFormChange("measurementUnit", value)
                    }
                    disabled={isEditMode || isFieldDisabled("measurementUnit")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockMeasurementUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-value">Target Value{!formData?.targetValue && <span className="text-red-500">*</span>}</Label>
                  <Input
                    id="target-value"
                    type="Number"
                    min="0"
                    inputMode="decimal"
                    value={
                      formData.targetValue === 0 ? "" : formData.targetValue
                    }
                    onChange={(e) =>
                      handleTargetValueChange(Number(e.target.value))
                    }
                    placeholder="Enter numeric value"
                    disabled={isFieldDisabled("targetValue")}
                    className={
                      validationErrors.targetValue ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.targetValue && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.targetValue}
                    </p>
                  )}
                </div>

                <CurrencySelector formData={formData} isFieldDisabled={isFieldDisabled} isEditMode={isEditMode} handleFormChange={handleFormChange} />

                <div className="space-y-2">
                  <Label>DivisionType</Label>
                  <div className="border rounded-md p-3">
                    <RadioGroup
                      value={formData.divisionType}
                      onValueChange={(value) =>
                        handleFormChange("divisionType", value)
                      }
                      className="flex gap-6"
                      disabled={isEditMode || isFieldDisabled("divisionType")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="standalone"
                          id="standalone"
                          disabled={
                            isEditMode || isFieldDisabled("divisionType")
                          }
                        />
                        <Label
                          htmlFor="standalone"
                          className={
                            isEditMode || isFieldDisabled("divisionType")
                              ? "opacity-70"
                              : ""
                          }
                        >
                          Standalone
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="cumulative"
                          id="cumulative"
                          disabled={
                            isEditMode || isFieldDisabled("divisionType")
                          }
                        />
                        <Label
                          htmlFor="cumulative"
                          className={
                            isEditMode || isFieldDisabled("divisionType")
                              ? "opacity-70"
                              : ""
                          }
                        >
                          Cumulative
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                  className="flex items-center text-sm font-medium"
                >
                  {showAdditionalInfo ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  )}
                  Additional Information
                </button>
                <div className="mt-1 border-t border-dashed" />
              </div>

              {showAdditionalInfo && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="quarter">Quarter</Label>
                      <Select
                        value={formData.quarter} // Bind to the actual quarter value (either _id or "qX-YYYY")
                        onValueChange={(value) => {
                          const selectedQuarter = quarterResponse.find(
                            (q) => `${q.quarter}-${q.year}` === value
                          );

                          if (selectedQuarter) {
                            handleFormChange("quarter", value);
                            handleFormChange(
                              "quarterStartDate",
                              selectedQuarter.start_date
                            );
                            handleFormChange(
                              "quarterEndDate",
                              selectedQuarter.end_date
                            );
                          }
                        }}
                        disabled={isEditMode || isFieldDisabled("quarter")}
                      >
                        <SelectTrigger className="w-full">
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
                            const value = `${quarter.quarter}-${quarter.year}`; // e.g., "q2-2025"
                            const endDate = new Date(quarter.end_date);
                            const currentDate = new Date();
                            const isDisabled = endDate < currentDate;

                            return (
                              <SelectItem
                                key={value}
                                value={value}
                                disabled={isDisabled}
                              >
                                {`${quarter.quarter.toUpperCase()} ${
                                  quarter.year
                                }`}{" "}
                                {/* Show "Q1 2025" */}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current-value">Current Value</Label>
                      <Input
                        id="current-value"
                    //      className={
                    //   validationErrors.currentValue ? "border-red-500" : ""
                    // }
                        placeholder="Enter the Current Value"
                        value={(formData.currentValue==0 && !isEditMode)? "": formData.currentValue}
                        onChange={(e) => {
                          // Only allow numbers and decimal point
                          const value = e.target.value.replace(/[^0-9.]/g, "");
                          handleFormChange("currentValue", value);
                        }}
                        disabled={isFieldDisabled("currentValue")|| isEditMode}
                      />
                       {/* {validationErrors.currentValue && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.currentValue}
                    </p>
                  )} */}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select
                        value={formData.frequency || mockFrequencies[0].id}
                        onValueChange={(value) =>
                          handleFormChange("frequency", value)
                        }
                        disabled={isEditMode || isFieldDisabled("frequency")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockFrequencies.map((freq) => (
                            <SelectItem key={freq.id} value={freq.id}>
                              {freq.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  {isEditMode &&  <div className="space-y-2">
                      <Label htmlFor="current-value">Initial Current Value</Label>
                      <Input
                        id="intial-current-value"
                         className={
                      validationErrors.initialCurrentValue ? "border-red-500" : ""
                    }
                        placeholder="Enter the Intial Current Value"
                        value={formData.initialCurrentValue}
                        onChange={(e) => {
                          // Only allow numbers and decimal point
                          const value = e.target.value.replace(/[^0-9.]/g, "");
                           handleFormChange("initialCurrentValue", value);
                           handleFormChange("currentValue", value)
                        }}
                        disabled={isFieldDisabled("initialCurrentValue")}
                      />
                       {validationErrors.initialCurrentValue && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.initialCurrentValue}
                    </p>
                  )}
                       <p className="text-sm text-muted-foreground">
      ⚠️ Changing this value will affect dependent calculations.
    </p>
                    </div>
                    }
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Target Breakdown</Label>
                {(formData.kpiType === "individual" &&
                  formData.ownerId.id &&
                  formData?.targetValue) ||
                (formData.kpiType === "team" &&
                  formData.assigneeIds?.length > 0 &&
                  formData?.targetValue) ||
                (formData.kpiType === "company" &&
                  formData.teamIds?.length > 0 &&
                  formData?.targetValue) ? (
                  <div className="w-full border rounded-md p-4">
                    {(formData.targetValue != 1 && formData.quarter) ? (
                      formData.initialCurrentValue >= formData.targetValue ? (
    <div className="text-red-600 text-sm mt-2 p-2 border border-red-200 bg-red-50 rounded">
      Error: Current value ({isEditMode?formData.currentValue: formData.initialCurrentValue}) cannot exceed or equal target value ({formData.targetValue})
    </div>
  ) :  (
    <>
    {/* {formData?.initialTargetValue} */}
                      <React.Suspense fallback={<div>Loading breakdown...</div>}>
                      <BreakdownTable
                        key={`breakdown-table-${resetBreakdownKey}`}
                        ref={breakdownTableRef}
                        config={{
                          kpiType: formData.kpiType,
                          targetValue: formData?.initialTargetValue,
                          divisionType: formData.divisionType,
                          frequency: formData.frequency || "weekly",
                          quarter: formData.quarter,
                          quarterStartDate:formData.quarterStartDate,
                          quarterEndDate:formData.quarterEndDate
                         
                        }}
                        data={{
                          items: getBreakdownItems(),
                          // exitParentBreakdown: parentBreakdown,
                        }}
                        handlers={{
                          onKpiNameChange: handleKpiNameChange,
                          onBreakdownValueChange: handleBreakdownValueChange,
                          onValidationChange: handleValidationChange,
                        }}
                        setters={{
                          // setParentBreakdown,
                          setNewBreakdown,
                          setRemainingContribution,
                        }}
                        flags={{
                          isEditMode,
                          isSubmit: isSubmitting,
                          isLinked:(isEditMode && formData.parentKpiId && formData.kpiType==='individual' )
                        }}
                      />
                      
                      </React.Suspense>
                      </>
                    )
                    ):(
                      <div className="text-red-600 text-sm mt-2">
                      {formData.targetValue == 1 ? 
      "Target value must be greater than 1" : 
      "Select Quarter First."
    }
                    </div>
                    )}
                    {formData.divisionType === "cumulative" ? (
                      <span className="text-sm text-gray-800 py-auto text-left ">
                        "Numbers after decimal are adjusted in the last week of
                        quarter"
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                ) : (
                  <Input
                    id="TargetBreakdown"
                    placeholder="No data available to display"
                    // value={formData.currentValue || currentValue}
                    readOnly={true}
                    className="text-black"
                    // disabled={true}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  className="min-h-[100px]"
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setFormData(getInitialFormData);
                  }}
                >
                  Cancel
                </Button>

                <Button 
                  className="bg-black text-white hover:bg-black/90"
                  onClick={handleSubmit}
                >
                  {isEditMode ? "Save Changes" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
     <Dialog open={showWarning} onOpenChange={setShowWarning} modal={true}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-white">
          <div className="bg-black text-white p-4">
            <DialogTitle className="text-lg font-semibold">Warning</DialogTitle>
          </div>
          <div className="p-4">
            <p className="text-base text-gray-800">
              Are you sure you want to update this team? The changes will be reflected in your data.
            </p>
          </div>
          <div className="flex justify-start gap-2 px-4 pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowWarning(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              className="bg-black text-white hover:bg-black/80"
            >
              Yes, Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
  );
}
