"use client";
import { AddKpiDialog } from "@/components/AddKPIDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ChevronDown, CirclePlus, Link2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import axiosInstance from "@/axios";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Link } from "react-router-dom";
import LineGraph from "@/graph/LineGraph";
import { MeterChart } from "@/graph/MerterChart";
import { Permission } from "@/contexts/PermissionsContext";
import AccessControl from "@/components/AccessControl";
import { LinkKpiDialog } from "@/components/kpi/LinkKpiDialog";
import { formattedValue } from "@/utils/ReusableFunctions";
import { KpiService } from "@/services/kpis";
import RenderHeatMap from "@/components/kpi/RenderHeatMap";
import RenderChildKpiTable from "@/components/kpi/RenderChildKpiTable";
import Pagination, { PaginationData } from "@/components/Pagination";
import { useSelectedUserQuarter } from "@/contexts/SelectedUserQuarterContext";
import { useAuth } from "@/contexts/AuthContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
export enum KpiType {
  Individual = "individual",
  Team = "team",
  Company = "company",
}
export type KpiResponse = {
  paginationData:PaginationData
  kpis: any[];
};
export const emptyKpiResponse: KpiResponse = {
  paginationData:{
    currentPage:1,
    pageSize:0,
    totalPages:0,
    totalRecords:0
  },
  kpis: [],
};
export type KpiTypePermissions = {
  [key in KpiType]: Permission[];
};
const KPIs = () => {
  const { selectedSingleUser, setSelectedSingleUser, singleQuarter } = useSelectedUserQuarter();
  const KpiTypePermissionsView: KpiTypePermissions = {
    [KpiType.Individual]: [Permission.VIEW_INDIVIDUAL_DASHBOARD],
    [KpiType.Team]: [Permission.VIEW_TEAM_KPI],
    [KpiType.Company]: [Permission.VIEW_ALL_KPI],
  };
  const KpiTypePermissionsCreate: KpiTypePermissions = {
    [KpiType.Individual]: [Permission.CREATE_INDIVIDUAL_KPI],
    [KpiType.Team]: [Permission.CREATE_TEAM_KPI],
    [KpiType.Company]: [Permission.CREATE_ALL_KPI],
  };
  const [selectedKpiType, setSelectedKpiType] = useState<KpiType>(() => {
    if (typeof window !== "undefined") {
      const savedType = localStorage.getItem("selectedKpiType");
      return savedType ? (savedType as KpiType) : KpiType.Individual;
    }
    return KpiType.Individual;
  });
  // const dropDownValue = [
  //   {id: 'createdAt',name:'Created At'},
  //   {id: 'updatedAt',name:'Updated At'},
  //   {id: 'ownerId.name', name: 'Grouping'}
  // ];

  const [expandedKpis, setExpandedKpis] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [_selectedKpi, setSelectedKpi] = useState<any>(null);
  const [selectedLinkingType, setSelectedLinkingType] = useState<string>("");
  const { toast } = useToast();
  const [kpiActiveTabs, setKpiActiveTabs] = useState<Record<string, string>>(
    {}
  );
  // const [showWarning, setShowWarning] = useState(false);
  const[activePage, setActivePage]=useState<number>((Number(localStorage.getItem('activePage'))|| 1))
  const [isLoading, setIsLoading] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedKpiForLinking, setSelectedKpiForLinking] = useState<any>(null);
  const [matchingTeams, setMatchingTeams] = useState<any[]>([]);
  const [kpiDataMap, setKpiDataMap] = useState<Record<string, KpiResponse>>({
    team: emptyKpiResponse,
    company: emptyKpiResponse,
    individual: emptyKpiResponse,
  });

  const kpis = kpiDataMap[selectedKpiType].kpis || [];
  // Helper to check if all KPIs on the current page are expanded
  const areAllCurrentPageKpisExpanded = kpis.length > 0 && kpis.every((kpi) => expandedKpis[kpi._id]);
  const limit = 10;

  const { user: userCheck } = useAuth();
  const fetchKpiData = async (pageNum: number, kpiType: KpiType) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await KpiService.getAllKpis({
        kpiType: kpiType,
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
      setKpiDataMap((prev) => ({
        ...prev,
        [kpiType]: {
          kpis: [...(response?.data || [])],
         paginationData:response.pagination
        },
      }));
    } catch (error) {
      console.error("Failed to fetch KPIs:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (selectedSingleUser?.length == 0) {
      setSelectedSingleUser(userCheck._id)
      fetchKpiData(1, selectedKpiType);
    }
  }, [userCheck.role === 'user'])

  useEffect(() => {
    fetchKpiData(1, selectedKpiType);
  }, [singleQuarter, selectedSingleUser]);  

  useEffect(() => {
    if (
      !kpiDataMap[selectedKpiType] ||
      kpiDataMap[selectedKpiType].kpis?.length === 0
    ) {
      fetchKpiData(activePage, selectedKpiType);
    }
  }, [selectedKpiType]);

  const handlePageChange = (pageNum: number) => {
    if (pageNum < 1) return;
    localStorage.setItem('activePage',pageNum.toString())
    setActivePage(pageNum)
    fetchKpiData(pageNum, selectedKpiType);
  };

  const handleKpiTypeChange = (type: KpiType) => {
    if (type === selectedKpiType) {
      return;
    }
    localStorage.setItem("selectedKpiType", type);
    localStorage.setItem('activePage',"1")
    setSelectedKpiType(type);
    setKpiDataMap((prev) => ({ ...prev, [type]: emptyKpiResponse }));
    fetchKpiData(1, type);
  };

  const handleCreateKpi = (formData: any) => {
    if (userCheck.isUserEdit && formData.divisionType == 'standalone') {
    // if (userCheck.isUserEdit) {
      formData.breakdownData = formData.breakdownData?.map((interval) => ({
        ...interval,
        // intervalTarget: Number(formData.targetValue),
        intervalTarget: Number(formData.targetValue) - Number(formData.currentValue),
      }));
    }
    // console.log(formData.breakdownData);
    
    // return
    axiosInstance
      .post("/kpis", formData)
      .then(() => {
        const resetTypes = Object.values(KpiType);
        const newKpiDataMap: Record<string, KpiResponse> = {};

        resetTypes.forEach((type) => {
          newKpiDataMap[type] = emptyKpiResponse;
        });

        setKpiDataMap((prev) => ({ ...prev, ...newKpiDataMap }));
        return fetchKpiData(1, selectedKpiType);
      })
      .then(() => {
        toast({
          title: "KPI Created",
          description: `${formData.name} has been created successfully.`,
        });
      })
      .catch((error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "An error occurred while creating the KPI.",
        });
      });
    return true;
  };

  const toggleExpand = (kpiId: string) => {
    setExpandedKpis((prev) => ({
      ...prev,
      [kpiId]: !prev[kpiId],
    }));
  };

  const handleFetchKpiLinkToParentKpi = async (kpi: any) => {
    try {
      // const response = await axiosInstance.get(
      //   `/kpis/${kpi._id}/matching-parent-kpis`
      // );
      const response = await axiosInstance.get(
        `/kpis/${kpi._id}/matching-parent-kpis/inputForm=false`
      );
      const parentKpis = response.data;

      if (parentKpis?.length === 0) {
        const label = kpi.kpiType === "individual" ? "teams" : "companies";
        toast({
          title: `No matching ${label} found`,
          description: `No ${label} KPIs found with matching criteria (frequency, quarter, measurement unit, division type,currency Type,${
            kpi.divisionType == "standalone" ? "target value" : ""
          })`,
          variant: "destructive",
        });
        return;
      }

      setSelectedLinkingType(kpi.kpiType);
      setSelectedKpiForLinking(kpi);
      setMatchingTeams(parentKpis); // This still works even if it's company-level — you can rename later
      setLinkDialogOpen(true);
    } catch (error) {
      const label = kpi.kpiType === "individual" ? "teams" : "companies";
      console.error(`Error fetching matching ${label}:`, error);
      toast({
        title: "Error",
        description: `No ${label} KPIs found with matching criteria (frequency, quarter, measurement unit, division type,${
          kpi.divisionType == "standalone" ? "target value" : ""
        })`,
        variant: "destructive",
      });
    }
  };

  const handleLinkKpiToParentKpi = async (teamId: string, type: string) => {
    try {
      if (!["company", "team"].includes(type)) {
        throw new Error("Invalid KPI type provided.");
      }

      const response = await axiosInstance.post(
        `/kpis/${selectedKpiForLinking._id}/link-to-parent/${teamId}/${type}`
      );
      if (response.status === 201) {
        toast({
          title: "Successfully linked",
          description: `KPI linked to ${type} successfully`,
        });
        setKpiDataMap((prev) => ({
          ...prev,
          [selectedKpiType]: emptyKpiResponse,
        }));
        fetchKpiData(activePage, selectedKpiType);
      } else {
        throw new Error("Failed to link KPI to parent.");
      }
    } catch (error) {
      console.error("Error linking KPI to team:", error);
      throw error;
    }
  };

  const renderTabButtons = useCallback(
    (kpi: any, type: KpiType) => {
      const tabs =
        type === KpiType.Individual
          ? ["graph", "heatmap"]
          : ["graph", "heatmap", "kpi"];

      const stateMap = {
        [KpiType.Individual]: kpiActiveTabs,
        [KpiType.Team]: kpiActiveTabs,
        [KpiType.Company]: kpiActiveTabs,
      };

      const setStateMap = {
        [KpiType.Individual]: setKpiActiveTabs,
        [KpiType.Team]: setKpiActiveTabs,
        [KpiType.Company]: setKpiActiveTabs,
      };

      return (
        <div className="bg-[#080808] flex w-full rounded-md px-4 py-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-md text-white text-sm ${
                (stateMap[type][kpi._id] || "heatmap") === tab
                  ? "bg-[#202020]"
                  : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setStateMap[type]((prev) => ({ ...prev, [kpi._id]: tab }));
                if (!expandedKpis[kpi._id]) {
                  toggleExpand(kpi._id);
                }
              }}
            >
              {tab === "kpi"
                ? tab.toUpperCase()
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      );
    },
    [expandedKpis, kpiActiveTabs, toggleExpand]
  );

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="w-full h-16 bg-[#222222] rounded-xl p-4 flex items-center justify-between">
        {/* <Tabs
          value={selectedKpiType}
          defaultValue={selectedKpiType}
          className="w-[350px]"
        >
          <TabsList className="flex w-full bg-black h-10 ">
            {Object.values(KpiType).map((kpiType) => (
              <AccessControl
                requiredPermissions={
                  KpiTypePermissionsView[kpiType as keyof KpiTypePermissions]
                }
                key={kpiType}
              >
                <TabsTrigger
                  key={kpiType}
                  value={kpiType}
                  onClick={() => handleKpiTypeChange(kpiType)}
                  className="data-[state=active]:bg-[#202020] text-white data-[state=active]:text-white"
                >
                  {kpiType.charAt(0).toUpperCase() + kpiType.slice(1)}
                </TabsTrigger>
              </AccessControl>
            ))}
          </TabsList>
        </Tabs> */}
        {/* User Permission wise */}
        <Tabs
          value={selectedKpiType}
          defaultValue={selectedKpiType}
          className="w-[350px]"
        >
          <TabsList className="flex w-full bg-black h-10">
            {Object.values(KpiType).map((kpiType) => {
              // Conditionally hide tabs based on user role
              if (userCheck?.role === "user" && kpiType !== "individual") {
                return null; // skip this tab
              }
              return (
                <AccessControl
                  requiredPermissions={
                    KpiTypePermissionsView[kpiType as keyof KpiTypePermissions]
                  }
                  key={kpiType}
                >
                  <TabsTrigger
                    key={kpiType}
                    value={kpiType}
                    onClick={() => handleKpiTypeChange(kpiType)}
                    className="data-[state=active]:bg-[#202020] text-white data-[state=active]:text-white"
                  >
                    {kpiType.charAt(0).toUpperCase() + kpiType.slice(1)}
                  </TabsTrigger>
                </AccessControl>
              );
            })}
          </TabsList>
        </Tabs>

        <AccessControl
          requiredPermissions={
            KpiTypePermissionsCreate[
              selectedKpiType as keyof KpiTypePermissions
            ]
          }
        >
          <div className="flex justify-end">
            <div className="flex justify-end gap-4 px-2">
              <Button
                className={`${
                  areAllCurrentPageKpisExpanded
                    ? "bg-red-700 hover:bg-red-600"
                    : "bg-green-700 hover:bg-green-600"
                } text-white`}
                onClick={() => {
                  if (areAllCurrentPageKpisExpanded) {
                    // Collapse all KPIs on the current page
                    setExpandedKpis((prev) => {
                      const updated = { ...prev };
                      kpis.forEach((kpi) => {
                        updated[kpi._id] = false;
                      });
                      return updated;
                    });
                  } else {
                    // Expand all KPIs on the current page
                    setExpandedKpis((prev) => {
                      const updated = { ...prev };
                      kpis.forEach((kpi) => {
                        updated[kpi._id] = true;
                      });
                      return updated;
                    });
                    setKpiActiveTabs((prev) => {
                      const newTabs = {};
                      kpis.forEach((kpi) => {
                        newTabs[kpi._id] = "heatmap";
                      });
                      return { ...prev, ...newTabs };
                    });
                  }
                }}
              >
                {areAllCurrentPageKpisExpanded ? "Collapse All" : "Expand All"}
              </Button>
            </div>
            <Button className="bg-black" onClick={() => setDialogOpen(true)}>
              <CirclePlus className="mr-1" />
              Add KPI
            </Button>
          </div>
        </AccessControl>

        {dialogOpen && (
          <AddKpiDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSave={handleCreateKpi}
            defaultKpiType={selectedKpiType}
          />
        )}
      </div>

      <div
        // className="flex flex-col gap-4 w-full h-[34.5rem] overflow-y-scroll max-h-fit"
        className={cn("flex flex-col gap-4 w-full overflow-y-scroll max-h-fit",
          (window.innerHeight <= 953 && window.innerHeight >= 768) ? "h-[41rem]" : "h-[34.5rem]"
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {kpis?.length === 0 ? (
          <div className="w-full h-24 bg-[#111111] text-white rounded-2xl flex items-center justify-center">
            No KPIs have been created for this user.
          </div>
        ) : (
          <>
            {kpis?.map((kpi) => {
              return (
                <div
                  key={kpi._id}
                  className={cn(
                    "w-full bg-[#111111] text-white rounded-2xl px-6 transition-all duration-300 ease-in-out cursor-pointer"
                  )}
                  onClick={() => setSelectedKpi(kpi)}
                >
                  <div className="flex h-24 justify-center items-center w-full ">
                    <div className="flex flex-col w-full text-[#BDBDBD] text-sm">
                      <Link to={`/kpi/${kpi._id}`}>
                        <div className="text-lg text-white">{kpi.name}</div>
                      </Link>
                      <div className="flex flex-wrap gap-1 items-center text-sm">
                        <span className="cursor-pointer hover:text-[#ffffff] transition-colors duration-200">
                          {kpi.quarter.replace("q", "Q").replace("-", " ")}
                        </span>
                        <span className="mx-1">•</span>
                        <span className="text-[#BDBDBD] hover:text-[#ffffff] transition-colors duration-200">
                          Owner : {kpi.ownerId.name}
                        </span>

                        {kpi.kpiType !== "company" && (
                          <>
                            <span className="mx-1">•</span>
                            <span className="text-[#BDBDBD] hover:text-[#ffffff] transition-colors duration-200">
                              Linked To:{" "}
                              {kpi.parentKpiId
                                ? kpi.parentKpiName
                                : "Not Linked"}
                            </span>
                          </>
                        )}

                        <span className="mx-1">•</span>
                        <span className="text-[#BDBDBD] hover:text-[#ffffff] transition-colors duration-200">
                          {kpi.divisionType.charAt(0).toUpperCase() +
                            kpi.divisionType.slice(1)}
                        </span>
                        {kpi.linkedTo && (
                          <>
                            <span className="mx-1">•</span>
                            <span>Linked to: {kpi.linkedTo}</span>
                          </>
                        )}

                        {kpi.contribution && (
                          <>
                            <span className="mx-1">•</span>
                            <span className="text-[#BDBDBD] hover:text-[#ffffff] transition-colors duration-200">
                              Contribution:{" "}
                              {formattedValue(Number(kpi.contribution))}%
                            </span>
                          </>
                        )}
                        {kpi.intervalsLeft && (
                          <>
                            <span className="mx-1">•</span>
                            <span className="p-0.5 px-2.5 bg-[#8C8C8C26] rounded-lg">
                              {kpi.intervalsLeft}
                            </span>
                          </>
                        )}
                        {kpi.remainingContribution &&
                          kpi.remainingContribution > 0 && kpi?.divisionType === 'cumulative' && (
                            <>
                              <span className="mx-1">•</span>
                              <span className="p-0.5 px-2.5 bg-[#c42c2c26] text-red-500 rounded-lg">
                                {kpi.remainingContribution}% Target Unassigned
                              </span>
                            </>
                          )}
                      </div>
                    </div>
                    <div className="flex gap-4 items-center justify-center">
                      <div className="w-full">
                        {renderTabButtons(kpi, kpi.kpiType as KpiType)}
                      </div>

                      <MeterChart newData={kpi} />

                      {kpi.kpiType !== "company" && (
                        <div
                          className={`flex px-3 py-2 rounded-md bg-[#080808] ${
                            kpi.parentKpiId
                              ? " cursor-not-allowed"
                              : " hover:bg-gray-500 cursor-pointer"
                          }`}
                          title={
                            kpi.parentKpiId ? "Already linked" : "Link KPI"
                          }
                          onClick={(e) => {
                            if (kpi.parentKpiId) {
                              // Don't do anything on click if it's already linked
                              e.preventDefault();
                              return;
                            }
                            e.stopPropagation();
                            if (["team", "individual"].includes(kpi.kpiType)) {
                              handleFetchKpiLinkToParentKpi(kpi);
                            } else {
                              console.warn("Unhandled KPI type:", kpi.kpiType);
                            }
                          }}
                        >
                          <div className="flex items-center justify-center rotate-90">
                            <Link2 size={23} />
                          </div>
                        </div>
                      )}

                      <Button
                        className="h-10 w-10 bg-[#080808]"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(kpi._id);
                          setKpiActiveTabs((prev) => ({
                            ...prev,
                            [kpi._id]: "heatmap",
                          }));
                        }}
                        aria-label={
                          expandedKpis[kpi._id] ? "Collapse" : "Expand"
                        }
                      >
                        <ChevronDown
                          className={cn(
                            "transition-transform duration-300 size-7",
                            expandedKpis[kpi._id] ? "transform rotate-180" : ""
                          )}
                        />
                      </Button>
                    </div>
                  </div>

                  {expandedKpis[kpi._id] && (
                    <div className="bg-black rounded-2xl transition-all duration-300 ease-in-out mb-3">
                      {expandedKpis[kpi._id] &&
                        kpi.kpiType === "individual" && (
                          <>
                            {!kpiActiveTabs[kpi._id] ||
                              (kpiActiveTabs[kpi._id] === "graph" && (
                                <LineGraph
                                  data={kpi}
                                  width={"100%"}
                                  height={"100%"}
                                  showLegend={false}
                                />
                              ))}
                            {kpiActiveTabs[kpi._id] === "heatmap" && (
                              <RenderHeatMap
                                breakdownData={kpi?.breakdownData}
                              />
                            )}
                          </>
                        )}

                      {expandedKpis[kpi._id] && kpi.kpiType === "team" && (
                        <>
                          {(!kpiActiveTabs[kpi._id] ||
                            kpiActiveTabs[kpi._id] === "graph") && (
                            <LineGraph
                              data={kpi}
                              width={"100%"}
                              height={"100%"}
                              showLegend={false}
                            />
                          )}
                          {kpiActiveTabs[kpi._id] === "heatmap" && (
                            <RenderHeatMap breakdownData={kpi?.breakdownData} />
                          )}
                          {kpiActiveTabs[kpi._id] === "kpi" && (
                            <RenderChildKpiTable childKpis={kpi?.childKpis} />
                          )}
                        </>
                      )}

                      {expandedKpis[kpi._id] && kpi.kpiType === "company" && (
                        <>
                          {(!kpiActiveTabs[kpi._id] ||
                            kpiActiveTabs[kpi._id] === "graph") && (
                            <LineGraph
                              data={kpi}
                              width={"100%"}
                              height={"100%"}
                              showLegend={false}
                            />
                          )}

                          {kpiActiveTabs[kpi._id] === "heatmap" && (
                            <RenderHeatMap breakdownData={kpi?.breakdownData} />
                          )}
                          {kpiActiveTabs[kpi._id] === "kpi" && (
                            <RenderChildKpiTable
                              childKpis={kpi?.childKpis}
                              isCompany={true}
                            />
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
      {kpis?.length > 0 && (
        <Pagination
        paginationData={kpiDataMap[selectedKpiType]?.paginationData}
        isLoading={false}
        onPageChange={handlePageChange}
      />
      )}
      <LinkKpiDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        matchingTeams={matchingTeams}
        onLink={handleLinkKpiToParentKpi}
        selectedLinkingType={selectedLinkingType}
      />
    </div>
  );
};

export default KPIs;
