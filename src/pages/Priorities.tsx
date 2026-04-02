import { Button } from "@/components/ui/button";
import { ChevronDown, CirclePlus, 
  // Filter
 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { PriorityService } from "@/services/priorities";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions, Permission } from "@/contexts/PermissionsContext";
import AccessControl from '@/components/AccessControl';
import { Priority, PriorityStatus } from "@/types/priority";
import { AddPriorityDialog } from "@/components/priority/addPriorityDialog";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { emptyKpiResponse, KpiResponse, KpiType } from "./KPIs";
import Pagination from "@/components/Pagination";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSelectedUserQuarter } from "@/contexts/SelectedUserQuarterContext";
import { cn } from "@/lib/utils";

export const weeks = [
  { label: 'Week 1', color: 'bg-black' },
  { label: 'Week 2', color: 'bg-black' },
  { label: 'Week 3', color: 'bg-black' },
  { label: 'Week 4', color: 'bg-black' },
  { label: 'Week 5', color: 'bg-black' },
  { label: 'Week 6', color: 'bg-black' },
  { label: 'Week 7', color: 'bg-black' },
  { label: 'Week 8', color: 'bg-black' },
  { label: 'Week 9', color: 'bg-black' },
  { label: 'Week 10', color: 'bg-black' },
  { label: 'Week 11', color: 'bg-black' },
  { label: 'Week 12', color: 'bg-black' },
  { label: 'Week 13', color: 'bg-black' }
];

 export const getWeekStatusColor = (priority: Priority, weekNumber: number): string => {
  // Find the corresponding week in weekStatusdata
  const weekData = priority.weekStatusdata?.find(
    week => week.intervalName === `Week ${weekNumber}` || 
           week.intervalIndex === weekNumber - 1
  );
  
  // Default to priority status if no specific week data found
  const status = weekData?.status || "";
  
  const colorMap: Record<PriorityStatus, string> = {

    'Not yet started': 'bg-red-500',
    'On track': 'bg-green-500',
    'Behind schedule': 'bg-[#FFA202F2]',
    'Complete': 'bg-blue-500',
    'Not applicable': 'bg-[#bdbdbd] text-black'
  };
  return colorMap[status] || 'bg-black';
};
const Priorities = () => {
  localStorage.setItem('activePage',"1")
  const [activeTab, setActiveTab] = useState<KpiType>(() =>{  if (typeof window !== "undefined") {
      const savedType = localStorage.getItem("selectedKpiType");
      return savedType ? (savedType as KpiType) : KpiType.Individual;
    }
    return KpiType.Individual});
  const [dialogOpen, setDialogOpen] = useState(false);
  // const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const [expandedPriorityIds, setExpandedPriorityIds] = useState<string[]>([]);
  const [prioDataMap, setPrioDataMap] = useState<Record<string, KpiResponse>>({
    team: emptyKpiResponse,
    company: emptyKpiResponse,
    individual: emptyKpiResponse,
  });
  const[activePage, setActivePage]=useState<number>((Number(localStorage.getItem('activePage'))|| 1))
  const priorities = prioDataMap[activeTab].kpis || [];
  const limit = 10;
  // Helper to check if all priorities on the current page are expanded
  const areAllCurrentPagePrioritiesExpanded = priorities.length > 0 && priorities.every((p) => expandedPriorityIds.includes(p._id));
  const { selectedSingleUser, singleQuarter } = useSelectedUserQuarter();
  useEffect(() => {
    localStorage.setItem('priorityType', activeTab);
  }, [activeTab]);

const getCurrentWeekStatus = (priority: Priority): PriorityStatus => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!priority.weekStatusdata?.length) {
    return "Not applicable";
  }

  const sortedWeeks = [...priority.weekStatusdata].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Find current or most recent past week
  for (let i = sortedWeeks.length - 1; i >= 0; i--) {
    const week = sortedWeeks[i];
    const endDate = new Date(week.endDate);
    
    if (now > endDate) {
      return week.status as PriorityStatus;
    }
  }

  return "Not applicable";
};

  const fetchPriorities = async (pageNum: number, activeTab: KpiType) => {
    if (loading) return;
    setLoading(true);
    try {
      const response: any = await PriorityService.getPrioritiesByType({
        prioType: activeTab,
        limit: limit,
        page: pageNum,
        filters: {
          "ownerId": [selectedSingleUser],
          "quarter": [singleQuarter]
        },
        sortBy: {
          field: "",
          order:"desc"
        }
      });
      setPrioDataMap((prev) => ({
        ...prev,
        [activeTab]: {
          kpis: [...(response?.data || [])],
          paginationData:response.pagination
        },
      }));
    } catch (error) {
      console.error("Failed to fetch Priority:", error);
        toast({
      title: "Error",
      description: "Failed to fetch priorities. Please try again.",
      variant: "destructive"
    });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPriorities(1, activeTab);
  }, [singleQuarter, selectedSingleUser]);

  if (!user) {
    return null;
  }
  // const availableTabs = [
  //   { id: 'individual', label: 'Individual', permission: Permission.VIEW_OWN_PRIORITY },
  //   { id: 'team', label: 'Team', permission: Permission.VIEW_TEAM_PRIORITY },
  //   { id: 'company', label: 'Company', permission: Permission.VIEW_ALL_PRIORITY }
  // ].filter(tab => hasPermission(tab.permission));
  // useEffect(() => {
  //   if (availableTabs.length > 0 && !availableTabs.find(tab => tab.id === activeTab)) {
  //     setActiveTab(availableTabs[0].id);
  //   }
  // }, []);
  // useEffect(() => {
  //   fetchPriorities();
  // }, [activeTab]);
  
  // useEffect(() => {
  //   if (
  //     !prioDataMap[activeTab] ||
  //     prioDataMap[activeTab].kpis?.length === 0
  //   ) {
  //     fetchPriorities(activePage, activeTab);
  //   }
  // }, [activeTab]);

  const handlePriorityClick = (priorityId: string) => {
    setExpandedPriorityIds((prev:any) => 
      prev.includes(priorityId)
        ? prev.filter((id:any) => id !== priorityId) // Remove if already expanded
        : [...prev, priorityId]               // Add if not expanded
    );
  };

  const formatQuarter = (quarter: string): string => {
    const [q, year] = quarter.split("-");
    return `${q.toUpperCase()} ${year}`;
  };

  const handleCreatePriority = async(formData: any) => {
     await PriorityService.createPriority(formData)
      .then(async() => {
        const res: any = await PriorityService.getPrioritiesByType({prioType: activeTab,
          limit: limit,
          page: activePage,
          filters: { "ownerId": [selectedSingleUser],
          "quarter": [singleQuarter]},
          sortBy: {
            field:"",
            order:"desc"
          }});
        // const sortedData = data.sort((a, b) => {
        //   const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        //   const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        //   return dateB - dateA;
        // });
        // setPrioDataMap(sortedData);
        setPrioDataMap((prev) => ({
        ...prev,
        [activeTab]: {
          kpis: [...(res?.data || [])],
         paginationData:res.pagination
        },
      }));
      })
      .then(() => {
        toast({
          title: "Priority Created",
          description: `${formData.name} has been created successfully.`,
        });
      })
      .catch((error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "An error occurred while creating the Priority.",
        });
      });
    return true;
  };

  const handlePageChange = (pageNum: number) => {
    if (pageNum < 1) return;
    localStorage.setItem('activePage',pageNum.toString())
    setActivePage(pageNum)
    fetchPriorities(pageNum, activeTab);
  };
  const handlePrioTypeChange = (type: KpiType) => {
    if (type === activeTab) {
      return;
    }
    localStorage.setItem("selectedKpiType", type);
    localStorage.setItem('activePage',"1")
    setActiveTab(type);
    setPrioDataMap((prev) => ({ ...prev, [type]: emptyKpiResponse }));
    fetchPriorities(1, type);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="w-full h-16 bg-[#222222] rounded-xl p-4 flex items-center justify-between ">
        <div className="flex space-x-1 bg-black p-1 rounded-lg  ">
          <button
            onClick={() => handlePrioTypeChange("individual"as KpiType)}
            className={`px-4 py-2 rounded-lg transition-colors   ${activeTab === "individual" ? "bg-[#202020] text-white" : "text-gray-400 hover:text-white"}`}
          >
            Individual Priority
          </button>
          {!(user?.role === 'user') && (
            <button
            onClick={() => handlePrioTypeChange("team" as KpiType)}
            className={`px-4 py-2 rounded-lg transition-colors ${activeTab === "team" ? "bg-[#202020] text-white" : "text-gray-400 hover:text-white"}`}
            >
            Team Priority
          </button>
          )}
          <AccessControl
            requiredPermissions={[Permission.VIEW_ALL_PRIORITY]}
          >
            <button
              onClick={() => handlePrioTypeChange("company" as KpiType)}
              className={`px-4 py-2 rounded-lg transition-colors ${activeTab === "company" ? "bg-[#202020] text-white" : "text-gray-400 hover:text-white"}`}
            >
              Company Priority
            </button>
          </AccessControl>
        </div>

        <div className="flex items-center space-x-2 ">
          <Button
            className={`mt-0 ${
              areAllCurrentPagePrioritiesExpanded
                ? "bg-red-700 hover:bg-red-600"
                : "bg-green-700 hover:bg-green-600"
            } text-white`}
            onClick={() => {
              if (areAllCurrentPagePrioritiesExpanded) {
                // Collapse all priorities on the current page
                setExpandedPriorityIds((prev) => prev.filter((id) => !priorities.some((p) => p._id === id)));
              } else {
                // Expand all priorities on the current page
                setExpandedPriorityIds((prev) => {
                  const currentIds = priorities.map((p) => p._id);
                  // Add only those not already in prev
                  return Array.from(new Set([...prev, ...currentIds]));
                });
              }
            }}
          >
            {areAllCurrentPagePrioritiesExpanded
              ? "Collapse All"
              : "Expand All"}
          </Button>
          {(activeTab === 'individual' && hasPermission(Permission.CREATE_OWN_PRIORITY)) ||
            (activeTab === 'team' && hasPermission(Permission.CREATE_TEAM_PRIORITY)) ||
            (activeTab === 'company' && hasPermission(Permission.CREATE_ALL_PRIORITY)) ? (
            <Button className="bg-black" onClick={() => setDialogOpen(true)}>
              <CirclePlus className="mr-1 font-normal text-base" />
              Add Priorities
            </Button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64   ">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className={cn("w-full grid grid-cols-1 gap-4 h-[41.5rem] overflow-y-scroll hide-scrollbar max-h-fit ",
          (window.innerHeight <= 953 && window.innerHeight >= 768) ? "h-[42rem]" : "h-[34.5rem]"
        )}
        >
          {priorities.map((priority) => (
            <div
              key={priority._id}
              className="bg-[#111111] text-white rounded-2xl p-4
               hover:bg-[#1a1a1a] transition-colors duration-200 shadow-lg border border-gray-800 cursor-pointer relative"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link to={`/priority/${priority._id}`}>
                  <h3 className="text-lg font-normal mb-2 text-white">{priority.name}</h3>
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-gray-400 ">
                    <span>{formatQuarter(priority.quarter)}</span>
                    <span className="mx-1">•</span>
                    <span>Owner : {typeof priority.owner === 'string' ? priority.owner: priority.owner?.name || 'Unknown User'}</span>
                    <span className="mx-1">•</span>
                    <span>Created by : {priority.createdBy?.name || 'Unknown User'}</span>
                    <span className="mx-1">•</span>
                    <div className="bg-[#8C8C8C26] px-3 py-1 rounded-full text-gray-400 text-sm inline-block ">
                      <div >
                        <span>
                          {priority.startWeek && priority.endWeek ? (() => {
                            const formatDate = (dateInput: Date | string): string => {
                              const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
                              if (isNaN(date.getTime())) {
                                console.error('Invalid date:', dateInput);
                                return 'Invalid Date';
                              }
                              return date.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: '2-digit',
                              }).replace(/ /g, '-');
                            };
                            const formattedStart = formatDate(priority.startWeek.startDate);
                            const formattedEnd = formatDate(priority.endWeek.endDate);
                            return (
                              <>
                                {formattedStart}
                                <span className="mx-1">To</span>
                                {formattedEnd}
                              </>
                            );
                          })() : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {priority.status && (
                  <div
                    className={` px-5 py-1 mt-2 rounded-sm text-sm text-center whitespace-nowrap min-w-[150px]
                       ${getCurrentWeekStatus(priority) === "Not yet started"
                        ? "bg-red-500  text-black"
                        : getCurrentWeekStatus(priority) === "On track"
                          ? "bg-green-500  text-black"
                          : getCurrentWeekStatus(priority) === "Behind schedule"
                            ? "bg-[#FFA202F2] text-black text-bold"
                            : getCurrentWeekStatus(priority) === "Complete"
                              ? "bg-blue-500  text-black"
                              : getCurrentWeekStatus(priority) === "Not applicable"
                                ? "bg-[#bdbdbd] text-black"
                                : "bg-[#222222]"
                      }`}
                  >
                    {getCurrentWeekStatus(priority)}
                  </div>
                )}
                <button
                  className="text-white ml-2 bg-black w-[48px] rounded-lg h-[40px] flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation(); // prevents outer div from triggering
                    handlePriorityClick(priority._id);
                  }}
                >
                  <ChevronDown  className={`transition-transform ${
                    expandedPriorityIds.includes(priority._id) ? "rotate-180" : ""
                  }`}  size={18} />
                </button>
              </div>
              
              {expandedPriorityIds.includes(priority._id) && priority.startWeek.startDate && priority.endWeek.endDate && (
                <div className="mt-4 border-t border-gray-800 pt-4  ">
                  <div className="flex flex-nowrap w-full ">
                    {weeks.map((week, index) => {
                       const weekNumber = index + 1;
                      return (
                        <div
                          key={index}
                          className="flex-grow flex-shrink basis-0 rounded-lg flex flex-col items-center  "
                        >
                          <h4 className="text-white font-normal mb-2 text-sm text-center">{week.label}</h4>
                          <div
                            className={`w-full h-12 flex items-center justify-center    ${getWeekStatusColor(priority,weekNumber )} 
                            ${index !== weeks.length - 1 ? 'border-r border-gray-700' : ''}`}
                          >
                            {/* <h4 className="text-white font-normal text-sm">{week.label}</h4> */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <h4 className="text-white font-normal text-sm opacity-0">{week.label}</h4>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="center" className="max-w-[300px]">
                                <p className="text-sm">
                                  {(() => {
                                    const weekData = priority.weekStatusdata?.find(
                                      w => w.intervalName === `Week ${weekNumber}` || 
                                          w.intervalIndex === weekNumber - 1
                                    );
                                    return weekData?.description || "No notes available";
                                  })()}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {priorities?.length === 0 ? (
        <div className="w-full h-24 bg-[#111111] text-white rounded-2xl flex items-center justify-center">
          No Priorities have been created for this user.
        </div>
      ) : ""}
      {dialogOpen &&  <AddPriorityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode="add"
        onSave={handleCreatePriority}
      /> } 
      {priorities?.length > 0 && (
          <Pagination
          paginationData={prioDataMap[activeTab]?.paginationData}
          isLoading={false}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Priorities;