import { Priority, WeekStatusUpdate } from "@/types/priority";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PriorityService } from "@/services/priorities";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/services/users";
import axiosInstance from "@/axios";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Permission } from "@/contexts/PermissionsContext"
import AccessControl from "@/components/AccessControl";
import { getWeekStatusColor, weeks } from "./Priorities";
import { UpdatePriorityDialog } from "@/components/priority/UpdatePriorityDialog";
import { AddPriorityDialog } from "@/components/priority/addPriorityDialog";
import { formatDateWithYear } from "@/utils/priorityUitls";

enum PriorityType {
    Individual = "individual",
    Team = "team",
    Company = "company",
  }
  
  type PriorityTypePermissions = {
    [key in PriorityType]: Permission[];
  };

const PriorityDetails = () => {
      const PriorityTypePermissionsEdit: PriorityTypePermissions = {
        [PriorityType.Individual]: [Permission.EDIT_OWN_PRIORITY],
        [PriorityType.Team]: [Permission.EDIT_TEAM_PRIORITY],
        [PriorityType.Company]: [Permission.EDIT_ALL_PRIORITY],
      };
    const { id } = useParams();
    const { user } = useAuth(); 
    const { toast } = useToast();
    const [EditdialogOpen, setEditDialogOpen] = useState(false);
    const [UpdatedialogOpen, setUpdateDialogOpen] = useState(false);
    const [priority, setPriority] = useState<Priority | null>(null);
    const [loading, setLoading] = useState(true);
    const [userNames, setUserNames] = useState<Record<string, string>>({});
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [editFormData, setEditFormData] = useState<Priority>({
        name: "",
        owner: { _id: "", name: "" },
        team: { _id: "", name: "" },
        quarter: "",
        startWeek: null,
        endWeek: null,
        description: "",
        type: "individual",
        status: "Not yet started",
        quarterStartDate: null,
        quarterEndDate: null,
    });

     const fetchPriorityHistory = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/priorities/${id}/history`);
                setHistoryData(response.data);
            } catch (err: any) {

            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        if (id) {
            fetchPriorityHistory();
        }
    }, [id]);

  useEffect(() => {
        if ((EditdialogOpen || UpdatedialogOpen) && priority) {
            setEditFormData({
                ...priority,
                owner: priority.owner || { _id: "", name: "" },
                team: priority.team || { _id: "", name: "" },
                weekStatusdata: priority.weekStatusdata || [],
            });
        }
    }, [EditdialogOpen, UpdatedialogOpen, priority]);

    useEffect(() => {
        const fetchPriority = async () => {
            try {
                if (!id) return;
                const data = await PriorityService.getPriority(id);

                const now = new Date();
                const startDate = new Date(data.startWeek?.startDate || data.quarterStartDate);
                const endDate = new Date(data.endWeek?.endDate || data.quarterEndDate);

                now.setHours(0, 0, 0, 0);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);

                let newStatus = data.status;

                if (now < startDate) {
                    newStatus = 'Not yet started';
                } else if (now >= startDate && now <= endDate) {
                    newStatus = 'On track';
                } else if (now > endDate) {
                    newStatus = 'Behind schedule';
                }

                // If status needs to be updated
                if (newStatus !== data.status) {
                    const updatedPriority = {
                        ...data,
                        status: newStatus,
                        userId: user?.id,
                    };
                   
                    setPriority({
                        ...updatedPriority,
                    });

                } else {
                    setPriority(data);
                }
            } catch (error) {
                console.error('Error fetching priority:', error);
                toast({
                    title: "Error",
                    description: "Failed to fetch priority details",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };
        fetchPriority();
    }, [id]);

    useEffect(() => {
        const fetchUserNames = async () => {
            try {
                const users = await UserService.getUsers();
                const userNameMap = users.reduce((acc, user) => {
                    acc[user._id] = user.name;
                    return acc;
                }, {} as Record<string, string>);
                setUserNames(userNameMap);
            } catch (error) {
                console.error('Error fetching user names:', error);
                toast({
                    title: "Error",
                    description: "Failed to fetch user names",
                    variant: "destructive"
                });
            }
        };
        fetchUserNames();
    }, [toast]);

    const formatFieldName = (field: string) => {
        const name = field === "weeklyStatus" ? "status" : field;
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const formatQuarter = (quarter: string): string => {
        const [q, year] = quarter.split("-");
        return `${q.toUpperCase()} ${year}`;
    };

    const handleEditPriority = async(formData: any) => {
        
     await PriorityService.updatePriority(priority._id,formData)
      .then(async() => {

        const data = await PriorityService.getPriority(id);
        setPriority(data);
        await fetchPriorityHistory()
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

   const handleUpdateWeekStatus = async (
  updates: WeekStatusUpdate[],
): Promise<any> => {
  try {
    const payload = {
      weekStatusUpdates: updates
    };

    const response:any =await PriorityService.updatePriorityWeekStatusData(priority._id,payload)
    if(response){

         const data = await PriorityService.getPriority(id);
         setPriority(data);
        await fetchPriorityHistory()
          toast({
          title: "Updated",
          description: "Week status updated successfully.",
        });
        return true
    }
   return false
  } catch (error) {
    console.error('Error updating week status:', error);
    return false
  }
};

    if (loading) {
        return <div className="w-full h-full bg-black text-white p-6">Loading...</div>;
    }

    if (!priority) {
        return <div className="w-full h-full bg-black text-white p-6">Priority not found</div>;
    }

    return (
        <div className="w-full h-full bg-black text-white   ">
            {/* Header */}
            <div className=" bg-[#222222] text-white rounded-2xl p-2 hover:bg-[#1a1a1a] transition-colors duration-200 shadow-lg border border-gray-800 relative  " >
                <div className="flex justify-between items-start ">
                    <button
                       onClick={() => window.history.back()}
                        className="p-2 rounded-full bg-[#222222] hover:bg-[#1a1a1a] text-white shadow-md"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h3 className="text-lg font-normal mb-2 text-white">{priority.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 ">
                            <span>{formatQuarter(priority.quarter)}</span>
                            <span className="mx-1">•</span>
                            <span>Owner : {  typeof priority.owner === 'string' ? priority.owner: priority.owner?.name || 'Unknown User'}</span>
                            <span className="mx-1">•</span>
                            <span>Created by : {priority.createdBy?.name || 'Unknown User'}</span>
                            <span className="mx-1">•</span>
                            <div className="bg-[#8C8C8C26] px-3 py-1 rounded-full text-gray-400 text-sm inline-block">
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
                    <div className=" ml-4 px-4 py-1 rounded-md text-lg flex space-x-4 ">
                      
                    <AccessControl
            requiredPermissions={
              PriorityTypePermissionsEdit[priority.type as keyof PriorityTypePermissions]
            }
          >
                                <button
                                    className="px-3 py-2 bg-black text-white rounded-md"
                                    onClick={() => setEditDialogOpen(true)}
                                >
                                    Edit
                                </button>
                                </AccessControl>

                                <AccessControl
            requiredPermissions={
              PriorityTypePermissionsEdit[priority.type as keyof PriorityTypePermissions]
            }
          >

                            <button
                                className="px-3 py-2 bg-black text-white rounded-md"
                                onClick={() => setUpdateDialogOpen(true)}
                            >
                                Update
                            </button>
                            </AccessControl>
                        
                    </div>
                </div>
            </div>
            <div className="flex flex-col lg:flex-row w-full gap-4 ">
                <div className=" flex flex-col w-full lg:w-3/4 ">
                    <div className=" bg-[#222222] mt-6 text-white rounded-2xl p-4 hover:bg-[#1a1a1a] transition-colors duration-200 shadow-lg border border-gray-800 relative">
                        <div className="  overflow-x-auto scrollbar-hide">
                            <div className="flex gap-0.5 min-w-max">
                                {weeks.map((week, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className="flex-grow flex-shrink basis-0 rounded-lg flex flex-col items-center cursor-pointer"
                                        >
                                            {(() => {
                                                 const weekNumber = index + 1;
                                              const weekData = priority.weekStatusdata?.find(
                                                    week => week.intervalName === `Week ${weekNumber}` || 
                                                        week.intervalIndex === weekNumber - 1
                                                );
                                                const description = weekData?.description?.trim() || 'No notes available ';

                                                if (description) {
                                                    return (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div
                                                                    className={`w-full h-13 flex items-center justify-center transition-all duration-300 ${getWeekStatusColor(priority,weekNumber )}`}
                                                                >
                                                                    <h4 className="text-white font-normal text-sm cursor-pointer">{week.label}</h4>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{description}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    );
                                                }
                                                return (
                                                    <div
                                                        className={`w-full h-13 flex items-center justify-center transition-all duration-300 ${getWeekStatusColor(priority,weekNumber )}`}
                                                    >
                                                        <h4 className="text-white font-normal text-sm">{week.label}</h4>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="  text-white rounded-2xl  duration-200 shadow-lg  relative">
                        <div className=" h-[254px] overflow-y-auto scrollbar-hide mr-auto  mt-6 text-white    duration-200 shadow-lg  relative">
                            <table className=" rounded-2xl w-full border-collapse ">
                                <thead>
                                    <tr className="bg-[#222222] font-normal  rounded-xl text-left">
                                        <th className="p-3 font-normal text-center ">Week</th>
                                        <th className="p-3 pl-6 w-[85%] font-normal  border-l border-l-gray-900">Notes</th>
                                        <th className="p-3 font-normal  text-center w-[15%] border-l border-l-gray-900">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* {priority.weekStatusdata
                                        // .filter(week => new Date(week.endDate) >= new Date())    //Week Data +4 Week
                                        .filter(week => new Date(week.endDate) <= new Date())     //Week data -4 week
                                        .sort((a, b) => a.intervalIndex - b.intervalIndex)
                                        .slice(0, 4)
                                        .map((week, index) => {
                                           const weekNumber = week.intervalIndex + 1;
                                            const statusColor = getWeekStatusColor(priority, weekNumber);
                                            return (
                                                <tr key={index} className="h-full bg-black border-b border-gray-700 ">
                                                    <td className="p-0 cursor-pointer">
                                                        <div className="flex-shrink-0 w-25 flex flex-col items-center">
                                                            <div
                                                                className={`w-full h-12 flex items-center justify-center transition-all duration-300 ${statusColor}`}
                                                            >
                                                                <h4 className="text-white font-normal text-sm">{week.intervalName}</h4>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 pl-5 text-white">
                                                        { week?.description }
                                                    </td>
                                                    <td className="p-3 text-right pr-14 text-white border-l border-l-gray-900">
                                                        {week ? formatDateWithYear(new Date(week.startDate)) : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    } */}
                                    {priority.weekStatusdata
  // Find current week index
  .map((week) => ({
    ...week,
    isCurrent: new Date(week.startDate) <= new Date() && new Date(week.endDate) >= new Date()
  }))
  // Sort by intervalIndex
  .sort((a, b) => a.intervalIndex - b.intervalIndex)
  // Filter to show current week and previous 4 weeks
  .filter((_, index, array) => {
    const currentWeekIndex = array.findIndex(w => w.isCurrent);
    if (currentWeekIndex === -1) return index < 4; // Fallback: show first 5 weeks if no current week found
    
    return index >= (currentWeekIndex - 3) && index <= currentWeekIndex;
  })
  // Ensure we always show exactly 5 weeks
  .slice(-5)
  .map((week, index) => {
    const weekNumber = week.intervalIndex + 1;
    const statusColor = getWeekStatusColor(priority, weekNumber);
    return (
      <tr key={index} className="h-full bg-black border-b border-gray-700">
        <td className="p-0 cursor-pointer">
          <div className="flex-shrink-0 w-25 flex flex-col items-center">
            <div
              className={`w-full h-12 flex items-center justify-center transition-all duration-300 ${statusColor} ${
                week.isCurrent ? 'ring-1 ring-white' : ''
              }`}
            >
              <h4 className="text-white font-normal text-sm">{week.intervalName}</h4>
            </div>
          </div>
        </td>
        <td className="p-3 pl-5 text-white">
          {week?.description}
        </td>
        <td className="p-3 text-right pr-14 text-white border-l border-l-gray-900">
          {week ? formatDateWithYear(new Date(week.startDate)) : '-'}
        </td>
      </tr>
    );
  })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* // Recent Activity */}

                <div className=" w-full lg:flex-1 mt-6 bg-[#080808] rounded-xl shadow-lg border border-gray-800 p-4 text-white max-h-100 overflow-y-auto space-y-4 scrollbar-hide ">
                    <h2 className="text-lg font-normal mb-4">Recent Activity</h2>


                    <div className="space-y-4">
                        {historyData
                            .filter(history => history.field !== "startDate" && history.field !== "endDate")
                            .map((history, index) => {
                                // Field label banane ka logic
                                let fieldLabel = "";
                                if (history.field.startsWith("weekStatusdata")) {
                                    fieldLabel = "Status";
                                } else {
                                    fieldLabel = formatFieldName(history.field);
                                }

                                // Previous value formatting
                                let formattedPreviousValue = "";
                                if (history.field === "owner") {
                                    formattedPreviousValue = userNames[history.previousValue] || 'Unknown User';
                                } else if (history.field === "startWeek" || history.field === "endWeek") {
                                    formattedPreviousValue = history.previousValue?.split('(')[0].trim();
                                } else {
                                    formattedPreviousValue =
                                        history.previousValue?.length > 10
                                            ? `${history.previousValue.slice(0, 10)}...`
                                            : history.previousValue;
                                }

                                return (
                                    <div key={index} className="border-b border-gray-700 pb-3">
                                        <div className="flex justify-between items-center text-md">
                                            <div>
                                                <p className="font-normal bg-opacity-20 inline-block py-1 rounded text-green-500">
                                                    {fieldLabel} {history.field=='Created Priority'? "":'Updated'}
                                                </p>
                                                <p className="text-white text-md" title={history.previousValue}>
                                                    {formattedPreviousValue}
                                                </p>
                                            </div>
                                            <div className="text-white text-md">{history.field=='Created Priority'? "Created By":'Updated By'}</div>
                                            <div className="text-right">
                                                <p className="text-green-400 mt-2 font-normal">{user?.name}</p>
                                                <p className="text-white text-md font-normal">
                                                    {history.createdAt ? (() => {
                                                        const date = new Date(history.createdAt);
                                                        const day = String(date.getDate()).padStart(2, '0'); // Add leading zero
                                                        const month = date.toLocaleString('en-US', { month: 'long' });
                                                        const year = date.getFullYear().toString().slice(-2);
                                                        return `${day}-${month}-${year}`;
                                                    })() : "N/A"}
                                                </p>


                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                </div>

            </div>
              <AddPriorityDialog
             open={EditdialogOpen}
             onOpenChange={setEditDialogOpen}
             mode="edit"
             initialData={priority}
             onSave={handleEditPriority}
           />
  {editFormData?.weekStatusdata &&
              <UpdatePriorityDialog
    open={UpdatedialogOpen}
    onOpenChange={setUpdateDialogOpen}
    formData={priority}
    onSubmit={handleUpdateWeekStatus}
  />}
        </div>
    );
};
export default PriorityDetails;
