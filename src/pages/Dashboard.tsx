import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  // DashboardMeterChartMax,
  DashboardMeterChartMini,
} from "@/graph/dashboardMeterChart";
import { useEffect, useState } from "react";
// import { ChartData, ChartOptions } from "chart.js";
// import BarChart from "@/graph/chart";
import { DashboardService } from "@/services/dashboard";
import { TeamService } from "@/services/teams";
// import axiosInstance from "@/axios";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Team } from "@/types/team";
import { GetTeamsResponse } from "@/types/dashboardTeam";
import { mockData } from "@/utils/dashboardUtills";
import { useAuth } from "@/contexts/AuthContext";
import DonutChart from "@/graph/donutChart";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-800 text-white text-sm p-2 rounded shadow-lg">
        <div>Est Target: {payload[0].value.toLocaleString()}</div>
        <div>Achieved: {payload[0].value.toLocaleString()}</div>
        <div>Target: {payload[0].value.toLocaleString()}</div>
      </div>
    );
  }
  return null;
};
const Dashboard = () => {
  // const [selectedNames, setSelectedNames] = useState<string[]>([]);
  // const [selectedKpis, setSelectedKpis] = useState<string[]>([]);
  // const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  // const nameOptions = ["Harsh Jian", "Ram", "Yash Sharma"];
  // const kpiOptions = ["MD Goa", "80 % Work", "Funnel Score"];
  // const priorityOptions = ["Acme Co.", "Big Kahuna Burger", "Barone LLC."];

  // const toggleSelection = (value: string, list: string[], setter: Function) => {
  //   if (list.includes(value)) {
  //     setter(list.filter((item) => item !== value));
  //   } else {
  //     setter([...list, value]);
  //   }
  // };

  const [chartData, setChartData] = useState([
    { name: "User A", currentValue: 200, targetValue: 1000, color: "#00BFFF" },
    { name: "User B", currentValue: 300, targetValue: 1000, color: "#FF9800" },
    { name: "User C", currentValue: 0, targetValue: 1000, color: "#FF9800" },
  ]);
  const [expandedPriorityIds, setExpandedPriorityIds] = useState<string[]>([]);

  const handlePriorityClick = (priorityId: string) => {
    setExpandedPriorityIds(
      (prev: any) =>
        prev.includes(priorityId)
          ? prev.filter((id: any) => id !== priorityId) // Remove if already expanded
          : [...prev, priorityId] // Add if not expanded
    );
  };
  const { user } = useAuth();

  // const chartData: ChartData<"bar"> = {
  //   labels: ["Q1-24", "Q2-24", "Q3-24", "Q4-24", "Q1-25", "Q2-25", "Q3-25"],
  //   datasets: [
  //     {
  //       label: "Revenue",
  //       data: [120, 190, 300, 500, 120, 190, 300],
  //       backgroundColor: "oklch(0.72 0.17 143.51)",
  //       barThickness: 40,
  //       borderRadius: 10,
  //     },
  //   ],
  // };

  // const chartOptions: ChartOptions<"bar"> = {
  //   responsive: true,
  //   bar: {
  //     datasets: {
  //       barThickness: 0,
  //     },
  //   },
  //   plugins: {
  //     legend: {
  //       position: "top",
  //     },
  //     title: {
  //       display: true,
  //       text: "Quarterly Revenue",
  //     },
  //   },
  // };
  enum KpiType {
    // Individual = "individual",
    // Company = "company",
    Dashboard = "myDashboard",
    Team = "team",
  }

  const [selectedDashType, setSelectedDashType] = useState<KpiType>(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      const savedType = localStorage.getItem("selectedDashType");
      return savedType ? (savedType as KpiType) : KpiType.Dashboard;
    }
    return KpiType.Dashboard;
  });
  // const KpiTypePermissionsView: KpiTypePermissions = {
  //   [KpiType.Individual]: [Permission.VIEW_INDIVIDUAL_DASHBOARD],
  //   [KpiType.Team]: [Permission.VIEW_TEAM_KPI],
  //   [KpiType.Company]: [Permission.VIEW_ALL_KPI],
  // };
  const handleKpiTypeChange = (type: KpiType) => {
    if (type === selectedDashType) {
      return;
    }
    localStorage.setItem("selectedDashType", type);
    setSelectedDashType(type);
  };

  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  // const [users, setUsers] = useState<User[]>([]);
  // const [teambyid, setTeamById] = useState<User[]>([]);
  const [selectedTeamById, setSelectedTeamById] = useState<GetTeamsResponse>();
  const [selectedTeamId, setSelectedTeamId] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsResponse: any = await TeamService.getTeams();
        if (teamsResponse.success) {
          setTeams(teamsResponse.data);
          setSelectedTeamId(teamsResponse.data[0]._id);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch data",
          variant: "destructive",
        });
      }
    };

    if (selectedDashType === "team") {
      fetchData();
    }
  }, [selectedDashType]);

  const [activeTab, setActiveTab] = useState("KPIS");
  const [_, setTeamMemberData] = useState<any>([]);
  const [teamMemberDataLocal, setteamMemberDataLocal] = useState([]);

  useEffect(() => {
    const fetchTeamMemberData = async (id: string) => {
      try {
        const response: any = await DashboardService.getUserById(id);
        if (!response?.success) {
          throw new Error("Failed to fetch team by user ID");
        }
        const teamData = response?.data;
        setSelectedTeamById(teamData);
        const memberIds =
          teamData?.teams[0]?.memberIds?.map((m: any) => m._id) || [];
        if (memberIds?.length === 0) {
          console.warn("No team members found");
          return;
        }
        // Step 2: Fetch team member KPI data
        let data: any = {
          memberId: memberIds,
        };
        const teamResponse: any = await DashboardService.getteamById(data);
        if (!teamResponse?.success) {
          throw new Error("Failed to fetch team member data");
        }
        const memberData = teamResponse?.data;
        setTeamMemberData(memberData);
        setteamMemberDataLocal(memberData);
        const getRandomColor = (): string => {
          const letters = "0123456789ABCDEF";
          let color = "#";
          for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
          }
          return color;
        };
        // Optional: build chart data here if needed
        const extractedTargetValues = memberData.map((item: any) => ({
          name: item?.name,
          targetValue: item?.targetValue,
          currentValue: item?.currentValue,
          color: getRandomColor(),
        }));
        setChartData(extractedTargetValues);
        // const extractedCurrentValue = memberData.map((item: any) =>
        //   ({name :item?.name, value: item?.currentValue, color: getRandomColor() })
        // );
        // setChartData(extractedCurrentValue)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to fetch data",
          variant: "destructive",
        });
      }
    };
    if (selectedTeamId) {
      fetchTeamMemberData(selectedTeamId);
    }
  }, [selectedTeamId]);

  const transformGraphData = selectedTeamById?.breakdownTotals.map((item) => ({
    week: item.intervalName,
    target: item.intervalTarget,
  }));

  async function SelectedTeamMethod(data: any) {
    setSelectedTeamId(data);
  }
  const [myDashboardData, setMyDashboardData] = useState<any>([]);
  useEffect(() => {
    const dashData = async (userId: any) => {
      try {
        const datanew: any = { memberId: [userId] };
        const data = await DashboardService.getteamById(datanew);
        setMyDashboardData(data?.data);
      } catch (error) {
        console.error("Failed to fetch team data:", error);
      }
    };
    if (selectedDashType == "myDashboard") {
      dashData(user._id);
    }
  }, [selectedDashType, user]);

  return true ? (
    <div className="min-h-screen flex flex-col items-center justify-center rounded-xl bg-zinc-900 text-white px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">User Dashboard</h1>
      <p className="text-lg md:text-xl text-gray-400 mb-8">Coming Soon...</p>
      <div className="w-36 h-36 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
      <p className="mt-8 text-sm text-gray-600">Stay tuned for updates!</p>
    </div>
  ) : (
    <div className="h-[calc(100vh-7rem)] overflow-y-auto ">
      {/* Tab list Start */}
      <div className="mb-5 w-full h-16 bg-[#222222] rounded-xl p-4 flex  items-center justify-between">
        <Tabs
          value={selectedDashType}
          defaultValue={selectedDashType}
          className="w-[max-content]"
        >
          <TabsList className="flex w-full bg-zinc-900 h-10 ">
            {Object.values(KpiType).map((kpiType) => (
              // <AccessControl
              //   requiredPermissions={
              //     KpiTypePermissionsView[kpiType as keyof KpiTypePermissions]
              //   }
              //   key={kpiType}
              // >
              <TabsTrigger
                key={kpiType}
                value={kpiType}
                onClick={() => handleKpiTypeChange(kpiType)}
                className="data-[state=active]:bg-[#000] text-white data-[state=active]:text-white"
              >
                {kpiType.charAt(0).toUpperCase() + kpiType.slice(1)}
              </TabsTrigger>
              // </AccessControl>
            ))}
          </TabsList>
        </Tabs>
        {/* Search Dropdown Start */}
        {/* <div className="bg-[#111111] text-white p-6 rounded-xl shadow-lg min-w-[700px]">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Filter</h2>
            <button className="text-sm text-blue-400" onClick={onClear}>
              Clear Filter
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                placeholder="🔍 Search"
                className="w-full bg-black border border-gray-700 rounded p-2 mt-2 text-sm"
              />
              <div className="mt-2 space-y-1 text-sm">
                {nameOptions.map((name) => (
                  <div
                    key={name}
                    onClick={() =>
                      toggleSelection(name, selectedNames, setSelectedNames)
                    }
                    className={`cursor-pointer p-1 rounded ${
                      selectedNames.includes(name)
                        ? "bg-white text-black"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">KPI’s</label>
              <input
                type="text"
                placeholder="🔍 Search"
                className="w-full bg-black border border-gray-700 rounded p-2 mt-2 text-sm"
              />
              <div className="mt-2 space-y-1 text-sm">
                {kpiOptions.map((kpi) => (
                  <div
                    key={kpi}
                    onClick={() =>
                      toggleSelection(kpi, selectedKpis, setSelectedKpis)
                    }
                    className={`cursor-pointer p-1 rounded ${
                      selectedKpis.includes(kpi)
                        ? "bg-white text-black"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    {kpi}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Priority</label>
              <input
                type="text"
                placeholder="🔍 Search"
                className="w-full bg-black border border-gray-700 rounded p-2 mt-2 text-sm"
              />
              <div className="mt-2 space-y-1 text-sm">
                {priorityOptions.map((priority) => (
                  <div
                    key={priority}
                    onClick={() =>
                      toggleSelection(
                        priority,
                        selectedPriorities,
                        setSelectedPriorities
                      )
                    }
                    className={`cursor-pointer p-1 rounded ${
                      selectedPriorities.includes(priority)
                        ? "bg-white text-black"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    {priority}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 text-right">
            <button
              onClick={() =>
                onApply({
                  names: selectedNames,
                  kpis: selectedKpis,
                  priorities: selectedPriorities,
                })
              }
              className="bg-white text-black px-4 py-2 rounded text-sm"
            >
              Apply
            </button>
          </div>
        </div> */}
        {/* Search Dropdown End */}
        {selectedDashType == "team" && (
          <select
            className="bg-[#000] text-sm text-white p-3 rounded-lg"
            // value={teams}
            onChange={(e) => SelectedTeamMethod(e.target.value)}
          >
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {/* Tab list End */}

      {/* Meter Chart Start */}
      <div className="flex flex-row gap-4 p-0 bg-black min-h-auto">
        {mockData.map((item, idx) => (
          <div
            key={idx}
            className="text-gray-400 bg-[#111] rounded-lg p-4 flex flex-row items-center justify-between w-1/4"
          >
            <div className="flex flex-col justify-center">
              <div className="font-semibold text-white">{item.label}</div>
              <div className="text-sm text-gray-400">
                {item.achieved}% {item.subtext}
              </div>
            </div>
            <div className="mx-4" />
            <div className="flex justify-center items-center">
              <DashboardMeterChartMini
                targetValue={item.target}
                currentValue={item.achieved}
              />
            </div>
          </div>
        ))}
      </div>
      {/* Meter Chart End */}

      {/* Member Row Start */}
      {selectedDashType == "team" &&
        selectedTeamById?.teams[0]?.memberIds?.map((member) => (
          <div className="row mt-5 space-y-4" key={member?._id}>
            <div
              key={member?._id}
              className="bg-zinc-900 text-white rounded-xl p-4 shadow-md border border-gray-800 w-full"
            >
              <div className="flex justify-between items-center cursor-pointer">
                <div className="space-y-1">
                  <div className="text-sm font-semibold">
                    {member?.name.toUpperCase() ?? "No Member"}
                  </div>
                  <div className="text-xs text-gray-400 flex flex-wrap gap-2">
                    <span>4ᵗʰ QTR 2024</span>
                    <span>
                      • Owner: {selectedTeamById?.teams[0].owner?.name}
                    </span>
                    <span>• Assigned To: {member?.name.toUpperCase()}</span>
                    <span>• Task Count: {teamMemberDataLocal?.length}</span>
                    <span className="bg-gray-700 px-2 py-0.5 rounded-full text-xs">
                      08 Days Left
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-white">
                    Task <span className="font-bold">05</span> /{" "}
                    {teamMemberDataLocal?.length} • 60% Completed
                  </div>
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-[60%]" />
                  </div>
                  <button className="p-1 rounded-full hover:bg-gray-700">
                    <Plus size={16} />
                  </button>
                  <button
                    className="p-1 rounded-full hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation(); // prevents outer div from triggering
                      handlePriorityClick(member._id);
                    }}
                  >
                    {expandedPriorityIds.includes(member._id) ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>
              </div>

              {expandedPriorityIds.includes(member._id) && (
                <div className="mt-4 overflow-auto">
                  <table className="min-w-full text-sm bg-[#000]">
                    <thead className="bg-zinc-900 text-white">
                      <tr>
                        <th className="p-3 text-left">S.no</th>
                        <th className="p-3 text-left">KPIs</th>
                        <th className="p-3 text-left">Unit</th>
                        <th className="p-3 text-left">Goal</th>
                        <th className="p-3 text-left">Achieved</th>
                        <th className="p-3 text-left">Weekly Goal</th>
                        <th className="p-3 text-left">Ending Apr 6</th>
                        <th className="p-3 text-left">Ending Apr 13</th>
                        <th className="p-3 text-left">Ending Apr 27</th>
                        <th className="p-3 text-left">Ending May 4</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMemberDataLocal.map((kpi, idx) => {
                        if (kpi.ownerId.id == member._id) {
                          const isPercentage =
                            kpi.measurementUnit === "percentage";
                          const achievedValue = isPercentage
                            ? kpi.targetValue > 0
                              ? Math.round(
                                  (kpi.currentValue / kpi.targetValue) * 100
                                )
                              : 0
                            : kpi.currentValue;
                          const weeklyValues = kpi.breakdownData
                            .slice(0, 4)
                            .map((week) => {
                              return isPercentage
                                ? week.intervalTarget > 0
                                  ? Math.round(
                                      (week.intervalContribution /
                                        week.intervalTarget) *
                                        100
                                    )
                                  : 0
                                : week.intervalContribution;
                            });
                          const unitDisplay = isPercentage ? "%" : "";
                          return (
                            <tr
                              key={kpi._id}
                              className="border-t border-gray-700"
                            >
                              <td className="p-3">
                                {String(idx + 1).padStart(2, "0")}
                              </td>
                              <td className="p-3">{kpi.name}</td>
                              <td className="p-3">
                                {isPercentage ? "Percentage" : "Count"}
                              </td>
                              <td className="p-3">
                                {kpi.targetValue}
                                {unitDisplay}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs text-black font-bold ${
                                    achievedValue >=
                                    (isPercentage ? 100 : kpi.targetValue)
                                      ? "bg-blue-400"
                                      : achievedValue >=
                                        (isPercentage
                                          ? 10
                                          : kpi.targetValue * 0.1)
                                      ? "bg-yellow-300"
                                      : "bg-red-500"
                                  }`}
                                >
                                  {achievedValue}
                                  {unitDisplay}
                                </span>
                              </td>
                              <td className="p-3">
                                {kpi.assigneeIds?.length || 1}
                              </td>
                              {weeklyValues.map((value, i) => (
                                <td key={i} className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs text-black font-bold ${
                                      value >=
                                      (isPercentage ? 100 : kpi.targetValue)
                                        ? "bg-blue-400"
                                        : value >=
                                          (isPercentage
                                            ? 2
                                            : kpi.targetValue * 0.02)
                                        ? "bg-lime-400"
                                        : "bg-red-500"
                                    }`}
                                  >
                                    {value}
                                    {unitDisplay}
                                  </span>
                                </td>
                              ))}
                            </tr>
                          );
                        }
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}
      {/* Member Row End */}

      {/* Member Row Start My Dashboard */}
      {selectedDashType == "myDashboard" && (
        <div className="row mt-5 space-y-4">
          <div className="bg-zinc-900 text-white rounded-xl p-4 shadow-md border border-gray-800 w-full">
            <div className="overflow-auto">
              <table className="min-w-full text-sm bg-[#000]">
                <thead className="bg-zinc-900 text-white">
                  <tr>
                    <th className="p-3 text-left">S.no</th>
                    <th className="p-3 text-left">KPIs</th>
                    <th className="p-3 text-left">Unit</th>
                    <th className="p-3 text-left">Goal</th>
                    <th className="p-3 text-left">Achieved</th>
                    <th className="p-3 text-left">Weekly Goal</th>
                    <th className="p-3 text-left">Ending Apr 6</th>
                    <th className="p-3 text-left">Ending Apr 13</th>
                    <th className="p-3 text-left">Ending Apr 27</th>
                    <th className="p-3 text-left">Ending May 4</th>
                  </tr>
                </thead>
                <tbody>
                  {myDashboardData?.map((kpi, idx) => {
                    // if (kpi.ownerId.id == member._id) {
                    const isPercentage = kpi.measurementUnit === "percentage";

                    const achievedValue = isPercentage
                      ? kpi.targetValue > 0
                        ? Math.round((kpi.currentValue / kpi.targetValue) * 100)
                        : 0
                      : kpi.currentValue;

                    const weeklyValues = kpi.breakdownData
                      .slice(0, 4)
                      .map((week) => {
                        return isPercentage
                          ? week.intervalTarget > 0
                            ? Math.round(
                                (week.intervalContribution /
                                  week.intervalTarget) *
                                  100
                              )
                            : 0
                          : week.intervalContribution;
                      });

                    const unitDisplay = isPercentage ? "%" : "";

                    return (
                      <tr key={kpi._id} className="border-t border-gray-700">
                        <td className="p-3">
                          {String(idx + 1).padStart(2, "0")}
                        </td>
                        <td className="p-3">{kpi.name}</td>
                        <td className="p-3">
                          {isPercentage ? "Percentage" : "Count"}
                        </td>
                        <td className="p-3">
                          {kpi.targetValue}
                          {unitDisplay}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs text-black font-bold ${
                              achievedValue >=
                              (isPercentage ? 100 : kpi.targetValue)
                                ? "bg-blue-400"
                                : achievedValue >=
                                  (isPercentage ? 10 : kpi.targetValue * 0.1)
                                ? "bg-yellow-300"
                                : "bg-red-500"
                            }`}
                          >
                            {achievedValue}
                            {unitDisplay}
                          </span>
                        </td>
                        <td className="p-3">{kpi.assigneeIds?.length || 1}</td>
                        {weeklyValues.map((value, i) => (
                          <td key={i} className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs text-black font-bold ${
                                value >= (isPercentage ? 100 : kpi.targetValue)
                                  ? "bg-blue-400"
                                  : value >=
                                    (isPercentage ? 2 : kpi.targetValue * 0.02)
                                  ? "bg-lime-400"
                                  : "bg-red-500"
                              }`}
                            >
                              {value}
                              {unitDisplay}
                            </span>
                          </td>
                        ))}
                      </tr>
                    );
                    // }
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Member Row End */}

      {/* Bar & Meter Chart Start */}
      <div className="flex flex-row gap-4 mt-5 w-full h-[400px]">
        <div className="w-1/2 bg-[#111111] rounded-lg p-4">
          {/* <BarChart data={chartData} options={chartOptions} /> */}
        </div>
        <div className="w-1/2 bg-[#111111] rounded-lg p-8 flex justify-beetween m-auto min-h-[400px] ">
          {/* <DashboardMeterChartMax
            targetValue={100}
            currentValue={Number(selectedTeamById?.meter.qtdAchieved)}
            width={400}
            height={200}
          /> */}
          <DonutChart data={chartData} />
          {/* <div>
            <div className="bg-[#111111] text-white rounded-lg p-4 w-max space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center gap-4 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="text-white">{item.count}</div>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
      {/* Bar & Meter Chart End */}

      {/* Linegraph start */}
      <div className="row mt-5">
        <div className="bg-zinc-900 text-white rounded-xl p-4 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div className="flex bg-[#111111] p-2 rounded-lg w-fit">
              {["KPIS", "Priorities"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1 text-sm font-medium rounded-md transition-colors
                    ${
                      activeTab === tab
                        ? "bg-zinc-800 text-white"
                        : "text-gray-400 hover:bg-gray-800"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <select className="bg-[#000] text-sm text-white p-3 rounded-lg">
                <option>Average Lead Count</option>
                <option>Conversion Rate</option>
              </select>
              <button className="bg-[#000] py-2 px-3 rounded-full hover:bg-gray-700">
                +
              </button>
              <button className="bg-[#000] py-2 px-3 rounded-full hover:bg-gray-700">
                ⛶
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transformGraphData}>
              <CartesianGrid stroke="#444" vertical={false} />
              <XAxis dataKey="week" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#60F5B4"
                strokeWidth={3}
                dot={{ fill: "#fff", stroke: "#60F5B4", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Linegraph end */}
    </div>
  );
};
export default Dashboard;

