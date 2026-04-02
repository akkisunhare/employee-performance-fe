import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
// import { DashboardService } from "@/services/dashboard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSelectedUserQuarter } from "@/contexts/SelectedUserQuarterContext";
import { KpiService } from "@/services/kpis";
import { PriorityService } from "@/services/priorities";
import DashboardKpiTable from "@/components/kpi/DashboardKpiTable";
import DashboardPrioTable from "@/components/priority/DashboardPrioTable";
import { MeterChart } from "@/graph/MerterChart";
import { cn } from "@/lib/utils";
// import DashboardKpiCard from "@/components/kpi/TeamKpiTable";
// import DashboardTeamKpiPrio from "@/components/kpi/TeamKpiPrioDashboard";

const DashboardNew = () => {
  const { user } = useAuth();

  enum KpiType {
    // Individual = "individual",
    // Company = "company",
    Dashboard = "myDashboard",
    Team = "team",
  }
  enum findKpiType {
    Individual = "individual",
    Team = "team",
    Company = "company",
  }

  const [selectedDashType, setSelectedDashType] = useState<KpiType>(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      const savedType = localStorage.getItem("selectedDashType");
      return savedType ? (savedType as KpiType) : KpiType.Dashboard;
    }
    return KpiType.Dashboard;
  });
  const { selectedSingleUser, setSelectedSingleUser, singleQuarter, setDashboardType } = useSelectedUserQuarter();

  const handleKpiTypeChange = (type: KpiType) => {
    if (type === selectedDashType) {
      return;
    }
    else {
    // if (type === "myDashboard") {
      setSelectedSingleUser(user._id);
    }
    localStorage.setItem("selectedDashType", type);
    setSelectedDashType(type);
    setDashboardType(type)
  };  

  const { toast } = useToast();
  const [kpiData, setKpiData] = useState([]);
  const [prioData, setPrioData] = useState([]);
  // const [kpiTeamData, setKpiTeamData] = useState([]);
  // const [prioTeamData, setPrioTeamData] = useState([]);
  // console.log( selectedSingleUser, singleQuarter);

  // New methods Start
  const fetchKpiData = async (user: any, kpiType: findKpiType) => {
    try {
      const response = await KpiService.getAllKpis({
        kpiType: kpiType,
        limit: 50,
        page: 1,
        filters: {
          ownerId: [user],
          quarter: [singleQuarter],
        },
        sortBy: {
          field: "",
          order: "desc",
        },
      });
      setKpiData(response.data);
    } catch (error) {
      console.error("Failed to fetch KPIs:", error);
    }
  };
  // useEffect(() => {
  //   let kpiType: any = "individual";
  //   if (selectedDashType == "myDashboard") {
  //     fetchKpiData(user?._id, kpiType);
  //     fetchPriorities(user?._id, kpiType);
  //   } else return;
  // }, [selectedDashType && singleQuarter]);

  const fetchPriorities = async (user: any, activeTab: findKpiType) => {
    try {
      const response: any = await PriorityService.getPrioritiesByType({
        prioType: activeTab,
        limit: 50,
        page: 1,
        filters: {
          ownerId: [user],
          quarter: [singleQuarter],
        },
        sortBy: {
          field: "",
          order: "desc",
        },
      });
      setPrioData(response?.data);
    } catch (error) {
      console.error("Failed to fetch Priority:", error);
      toast({
        title: "Error",
        description: "Failed to fetch priorities. Please try again.",
        variant: "destructive",
      });
    }
  };

  // const kpiPrioritiesTeamsData = async () => {
  //   try {
  //     const response: any = await DashboardService.getAllDataKP({
  //       memberId: user?._id,
  //       type: 'team'
  //     });
  //     console.log(response.data);
  //     // setKpiTeamData(response?.data?.kpiData);
  //     setPrioTeamData(response?.data?.prioData);
  //   } catch (error) {
  //     console.error("Failed to fetch Priority:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch priorities. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  // useEffect(() => {
  //   if (selectedDashType == "team") {
  //     kpiPrioritiesTeamsData();
  //   } else return;
  // }, [selectedDashType]);

  useEffect(() => {
    let kpiType: any = "individual";
    // if (selectedDashType == "team") {
      fetchKpiData(selectedSingleUser?.toString() || user._id, kpiType);
      fetchPriorities(selectedSingleUser?.toString() || user._id, kpiType);
    // } else return;
  }, [selectedSingleUser, singleQuarter ]);
  // New methods End

  const calculateSum = (item) => {
    const today = new Date();
    // Filter out current week and only keep updated weeks with valid contributions
    const validWeeks = item.breakdownData.filter(week => {
      const start = new Date(week.startDate);
      const end = new Date(week.endDate);
      const isCurrentWeek = today >= start && today <= end;
      const isValidContribution = !isNaN(Number(week.intervalContribution));
      return (
        !isCurrentWeek &&
        isValidContribution &&
        week.isUpdated === true
      );
    });
    const sum = validWeeks.reduce((total, week) => {
      return total + Number(week.intervalContribution);
    }, 0);
    if (item.divisionType === 'cumulative') {
      return sum + item.initialCurrentValue
    }
    const divisor = validWeeks.length;
    if (divisor === 0) return 0;
    const average = sum / divisor;
    return Math.round(average);
  };

  return false ? (
    <div className="min-h-screen flex flex-col items-center justify-center rounded-xl bg-zinc-900 text-white px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">User Dashboard</h1>
      <p className="text-lg md:text-xl text-gray-400 mb-8">Coming Soon...</p>
      <div className="w-36 h-36 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
      <p className="mt-8 text-sm text-gray-600">Stay tuned for updates!</p>
    </div>
  ) : (
    <div className="h-[calc(100vh-7rem)] overflow-y-scroll scroll-smooth hide-scrollbar">
      {/* Tab list Start */}
      <div className="mb-5 w-full h-16 bg-[#222222] rounded-xl p-4 flex  items-center justify-between">
        <Tabs
          value={selectedDashType}
          defaultValue={selectedDashType}
          className="w-[max-content]"
        >
          <TabsList className="flex w-full bg-[#000] h-10 ">
            {Object.values(KpiType).map((kpiType) => {
              // Show all tabs for admin/organizationOwner
              if (
                user.role === "admin" ||
                user.role === "organization_owner" ||
                user.role === "manager" ||
                (user.role === "user" && kpiType === "myDashboard")
              ) {
                return (
                  <TabsTrigger
                    key={kpiType}
                    value={kpiType}
                    onClick={() => handleKpiTypeChange(kpiType)}
                    className="data-[state=active]:bg-[#1F1F1F] text-white data-[state=active]:text-white px-4 rounded-md"
                  >
                    {kpiType.charAt(0).toUpperCase() + kpiType.slice(1)}
                  </TabsTrigger>
                );
              }
              return null;
            })}
          </TabsList>
        </Tabs>
      </div>
      {/* Tab list End */}

      {/* Meter Chart Start */}
      <div className="bg-black w-full py-3">
        <div
          className={cn(
            "flex w-full",
            kpiData?.length > 4
              ? "overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 custom-scroll-container"
              : ""
          )}
        >
          {kpiData?.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "bg-[#111] text-gray-400 rounded-xl mr-3 p-3 flex flex-col items-center min-w-[250px] flex-shrink-0",
                kpiData?.length <= 4 && "w-full",
                kpiData?.length === 1 && "max-w-[25%]",
                kpiData?.length === 2 && "max-w-[40%]",
                kpiData?.length === 3 && "max-w-[30%]",
                kpiData?.length === 4 && "max-w-[25%]"
              )}
            >
              <div className="flex justify-center items-center">
                <MeterChart newData={item} />
              </div>
              <div className="font-semibold text-white mt-2 text-center" title={item?.name}>
                {item?.name?.length > 10 ? item.name.slice(0, 20) + "..." : item?.name}
              </div>
              {/* <div className="text-sm text-gray-400 mt-1 text-center">
                Target: {item.targetValue} - Achieved: {Number.isInteger(item.currentValue)
                  ? item.currentValue
                  : Number(item.currentValue).toFixed(2)}
              </div> */}
              <div className="text-sm text-gray-400 mt-1 text-center">
                {(() => {
                  // const today = new Date();
                  // const breakdown = item.breakdownData || [];
                  // const currentWeekIndex = breakdown.findIndex(
                  //   (interval) =>
                  //     new Date(interval.startDate) <= today &&
                  //     today <= new Date(interval.endDate)
                  // );
                  // const previousWeek =
                  //   currentWeekIndex > 0 ? breakdown[currentWeekIndex - 1] : null;
                  // const prevAchieved = previousWeek?.intervalContribution ?? 0;
                  return (
                    <>
                      Target: {item.targetValue} - Achieved: {" "}
                      {/* {Number.isInteger(prevAchieved)
                        ? prevAchieved
                        : Number(prevAchieved).toFixed(2)} */}
                        { calculateSum(item)}
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Meter Chart End */}

      {/* Kpi Table Start */}
      {(kpiData?.length > 0) && <DashboardKpiTable data={kpiData} quarter={singleQuarter} userId={selectedSingleUser} />}
      {/* Kpi Table End */}

      {/* Team Dashboard KPI Data Start*/}
      {/* {(kpiTeamData?.length > 0 && selectedDashType == 'team') && <DashboardKpiCard kpiData={kpiTeamData} />} */}
      {/* Team Dashboard KPI Data End*/}

      {/* Team Dashboard According to ashima start */}
      {/* {(kpiTeamData?.length > 0 && selectedDashType == 'team') && <DashboardTeamKpiPrio kpiData={kpiTeamData} />} */}
      {/* Team Dashboard According to ashima end  */}

      {/* Priorities Table Start */}
      {prioData?.length > 0 && <DashboardPrioTable data={prioData} quarter={singleQuarter} userId={selectedSingleUser}/>}
      {/* Priorities Table End */}

      {/* If no data Found */}
      {(prioData?.length == 0 && kpiData?.length == 0) && (
        <div className="min-h-screen flex flex-col items-center justify-center rounded-xl bg-zinc-900 text-white px-4">
          <p className="text-lg md:text-xl text-gray-400 mb-2">No KPIs/Priorities have been created for this user.</p>
          <p className="mt-2 text-lg text-gray-600">No data found...</p>
        </div>
      )}
      {/* If no data Found */}
    </div>
  );
};
export default DashboardNew;
