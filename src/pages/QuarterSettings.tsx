"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import axiosInstance from "@/axios";
import { useToast } from "@/hooks/use-toast";
import { Quarter } from "@/types/kpi";
import { useAuth } from "@/contexts/AuthContext";
import { QuarterService } from "@/services/quaterService";

const years = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() + i
);

const quarters = ["q1", "q2", "q3", "q4"];
const QuarterSettings = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quartersList, setQuartersList] = useState<Quarter[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editQuarterId, setEditQuarterId] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<
      Record<string, string>
    >({});
    const { toast } = useToast();
    const [showWarning, setShowWarning] = useState(false);
    const [showEnableDialog, setShowEnableDialog] = useState(false);
    const [pendingEnabled, setPendingEnabled] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    year: "",
    quarter: "",
    start_date: "",
    end_date: "",
  });

  const { user: userCheck } = useAuth();
  // const [enabled, setEnabled] = useState(userCheck?.isUserEdit);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "start_date") {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 90);

      setFormData({
        ...formData,
        start_date: value,
        end_date:formatDate(endDate),
      });

      setValidationErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors["start_date"];
        delete updatedErrors["end_date"];
        return updatedErrors;
      });
    } else {
      setFormData({ ...formData, [name]: value });
      setValidationErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleEditQuarter = (quarter: Quarter) => {
  
    const startDate = new Date(quarter?.start_date);
    const endDate = new Date(quarter?.end_date);

    startDate.setHours(0, 0, 0, 0);  // Set to midnight (00:00:00)
  endDate.setHours(0, 0, 0, 0); 
    
    setFormData({
      year: quarter.year.toString(),
      quarter: quarter.quarter,
      start_date: formatDate(startDate), // "YYYY-MM-DD"
      end_date: formatDate(endDate),
    });
    setEditQuarterId(quarter._id);
    setIsEditMode(true);
    setDialogOpen(true);
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setValidationErrors((prev) => {
      const updatedErrors = { ...prev };
      delete updatedErrors[field];
      return updatedErrors;
    });
  };
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.year) errors.year = "Year is required";
    if (!formData.quarter) errors.quarter = "Quarter is required";
    if (!formData.start_date) errors.start_date = "Start Date is required";
    if (!formData.end_date) errors.end_date = "End Date is required";
    return errors;
  };

  const saveQuarter = async () => {
    const payload = {
      year: Number(formData.year),
      quarter: formData.quarter,
      start_date: formData.start_date,
      end_date: formData.end_date,
    };
    try {
      let response;
      if (isEditMode && editQuarterId) {
        try{
          response = await axiosInstance.put(
          `/quarters/${editQuarterId}`,
          payload
        )}catch(err : any){
          setShowWarning(false); // Close the warning dialog after saving
          toast({
            title: err?.response?.data?.message,
            description:  err?.response?.data?.message,
            variant: "destructive",
          })
          return ; 
        }
        const updatedQuarter = response?.data?.data;
        setQuartersList((prev) =>
          prev.map((q) => (q._id === editQuarterId ? updatedQuarter : q))
        );
      } else {
        const response = await axiosInstance.post(`/quarters`, payload);
        const createdQuarter = response?.data?.data;
        setQuartersList([...quartersList, createdQuarter]);
      }
      // Reset state
      setFormData({ year: "", quarter: "", start_date: "", end_date: "" });
      setDialogOpen(false);
      setEditQuarterId(null);
      setIsEditMode(false);
      setShowWarning(false); // Close the warning dialog after saving
      fetchQuarters();
      window.location.reload();
    } catch (err: any) {
      console.error("Error saving quarter:", err.message);
    }
  };

  const isOverlappingWithPreviousQuarter = (startDate: string, endDate: string, quarterName: string) => {
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    // Find the previous quarter based on the quarter name
    const currentQuarterIndex = quartersList.findIndex((q) => q.quarter === quarterName);
    if (currentQuarterIndex === -1) {
      return false;
    }
    const previousQuarter = quartersList[currentQuarterIndex - 1];
    if (!previousQuarter) {
      return false;
    }  
    const prevStart = new Date(previousQuarter.start_date);
    const prevEnd = new Date(previousQuarter.end_date);
    // Check if the new range overlaps with the previous quarter
    const isOverlap = newStart <= prevEnd && newEnd >= prevStart;
    return isOverlap;
  };
  
  const handleSaveQuarter = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
    
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "All fields are required.",
      });
    
      return;
    }
    if (isOverlappingWithPreviousQuarter(formData.start_date, formData.end_date,formData.quarter)) {
      toast({
        variant: "destructive",
        title: "Date Range Conflict",
        description: "Date range already in existing quarter. Please select a different one.",
      });
      return;
    }
  
    if (isEditMode) {
      setShowWarning(true); // Ensure this line is being triggered
    } else {
      saveQuarter();
    }
  };

  const fetchQuarters = async () => {
    try {
      const response = await axiosInstance.get("/quarters");
      setQuartersList(response?.data?.data);
    } catch (err) {
      console.error("Error fetching quarters:", err);
    }
  };

  useEffect(() => {
    fetchQuarters();
  }, []);

  const checkUserRole = userCheck.organizationRoles.find((item:any)=>item.organizationId == localStorage.getItem('currentOrganizationId'));
  const currentOrg = localStorage.getItem('currentOrganizationId');

  const [enabled, setEnabled] = useState(() => {
    // Initialize from localStorage or user context
    const savedState = localStorage.getItem('editPermissionsEnabled');
    return savedState ? JSON.parse(savedState) : userCheck?.isUserEdit || false;
  });
  useEffect(() => {
    localStorage.setItem('editPermissionsEnabled', JSON.stringify(enabled));
  }, [enabled]);

  const savePermission = async () => {
    try {
      const data = await QuarterService.editPermission(currentOrg, enabled);
      console.log(data);
      
      // Update both local state and context
      if (userCheck) {
        userCheck.isUserEdit = enabled;
      }
      
      // Optional: refresh if absolutely needed
      // setTimeout(() => window.location.reload(), 1000);
      
    } catch (error) {
      console.error("Failed to update permissions:", error);
      // Revert the state on error
      setEnabled(prev => !prev);
    }
  };

  // Update the enable/disable handler
  // const handleToggleChange = () => {
  //   const newEnabledState = !enabled;
  //   setPendingEnabled(newEnabledState);
  //   setShowEnableDialog(true);
  // };

  // Update the dialog confirm handler
  const confirmPermissionChange = () => {
    setEnabled(pendingEnabled!);
    setShowEnableDialog(false);
    savePermission(); // This will now update the UI without page reload
    setTimeout(() => window.location.reload(), 100);
  };
  
  useEffect(() => {
    savePermission();
  }, [enabled]);  
  // console.log(userCheck?.isUserEdit);
  
  return (
    <main className="min-h-screen w-full bg-black text-white px-0.5 py-2">
      <div className="bg-[#111111] rounded-lg p-4 mb-4 flex justify-between items-center">
        <h1 className="text-lg font-medium">Quarter Settings</h1>
        {(checkUserRole?.role == 'organization_owner' || checkUserRole?.role == 'admin') && (
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{enabled ? "Enabled" : "Disabled"}</span>
              <button
                onClick={() => {
                  const newValue = !enabled;
                  setPendingEnabled(newValue);
                  setShowEnableDialog(true);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                  enabled ? "bg-yellow-500" : "bg-gray-400"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}/>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full ">
        <div className="space-y-2 w-full gap-7 bg-[#000000]">
          {Array.isArray(quartersList)&& quartersList?.map((q) => (
            <div
              key={q._id}
              className="bg-[#111111] py-5 px-6 rounded-md flex justify-between items-start"
            >
              <div className="flex flex-col w-full text-[#BDBDBD] text-sm">
                <p className="text-white font-normal text-base ">
                  {q.year} - Quarter {q.quarter.toUpperCase()}
                </p>
                <p className="text-[#BDBDBD] text-sm hover:text-[#ffffff] transition-colors duration-200">
                <p className="text-[#BDBDBD] text-sm hover:text-[#ffffff] transition-colors duration-200">
  From {new Date(q.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to{" "}
  {new Date(q.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
</p>
                </p>
              </div>
              {(userCheck?.role == 'organization_owner' || userCheck?.role == 'admin') && (
                <div className="flex gap-2 items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      handleEditQuarter(q);
                      setValidationErrors({});
                    }}
                  >
                    Edit
                  </Button>
                </div> 
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden bg-white">
          <div className="bg-black text-white p-4">
            <DialogTitle className="text-xl font-semibold">
              {isEditMode ? "Edit Quarter" : "Create Quarter"}
            </DialogTitle>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Select Year */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Select Year
              </label>
              <Select
                value={formData.year}
                onValueChange={(value) => handleSelectChange("year", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.year && <p className="text-red-500 text-sm mt-1">{validationErrors.year}</p>}
            </div>

            {/* Select Quarter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Select Quarter
              </label>
              <Select
                value={formData.quarter}
                onValueChange={(value) => handleSelectChange("quarter", value)}
                disabled
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Quarter" />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map((q) => (
                    <SelectItem key={q} value={q}>
                      {q.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.quarter && <p className="text-red-500 text-sm mt-1">{validationErrors.quarter}</p>}
            </div>

            {/* Start Date */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Start Date
              </label>
              <Input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                min={formData.year ? `${formData.year}-01-01` : undefined}
                placeholder="Select Start Date"
              />
               {validationErrors.start_date && <p className="text-red-500 text-sm mt-1">{validationErrors.start_date}</p>}
            </div>

            {/* End Date */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                End Date
              </label>
              <Input
                type="date"
                name="end_date"
                value={formData.end_date}
                min={`${new Date().getFullYear()}-01-01`}
                readOnly
                className="cursor-not-allowed bg-gray-100 text-gray-700"
              />
               {validationErrors.end_date && <p className="text-red-500 text-sm mt-1">{validationErrors.end_date}</p>}
            </div>
          </div>

          <div className="flex justify-start gap-2 px-4 pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveQuarter}
              className="bg-black text-white hover:bg-black/80"
            >
              {isEditMode ? "Update" : "Save"}
            </Button>
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
              Update this quarter? Changes won't reflect in your previous data.
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
              onClick={saveQuarter}
              className="bg-black text-white hover:bg-black/80"
            >
              Yes, Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog} modal={true}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-white">
        <div className="bg-black text-white p-4">
          <DialogTitle className="text-lg font-semibold">Warning</DialogTitle>
        </div>
        <div className="p-4">
          <p className="text-base text-gray-800">
            {pendingEnabled
              ? "Enable editing past week KPI's & Priorities?"
              : "Disable editing past week KPI's & Priorities?"}
          </p>
        </div>
        <div className="flex justify-start gap-2 px-4 pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowEnableDialog(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmPermissionChange}
            className="bg-black text-white hover:bg-black/80"
          >
            Yes, Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </main>
  );
};

export default QuarterSettings;
