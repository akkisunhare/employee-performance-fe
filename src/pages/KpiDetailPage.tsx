"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { AddKpiDialog } from "@/components/AddKPIDialog";
import {
  Tooltip,
  Tooltip as Tooltip2,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UpdateKpiDialog } from "@/components/kpi/UpdateKpiDialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/axios";
import { Badge } from "@/components/ui/badge";
import LineGraph from "@/graph/LineGraph";
import { Link, useNavigate, useParams } from "react-router-dom";
import AccessControl from "@/components/AccessControl";
import { Permission } from "@/contexts/PermissionsContext";
import { LinkKpiDialog } from "@/components/kpi/LinkKpiDialog";
import { KpiTypePermissions } from "./KPIs";
import { TeamService } from "@/services/teams";
import { KpiService } from "@/services/kpis";
import { formattedValue } from "@/utils/ReusableFunctions";
import { getColorByPercentage, getTextColor } from "@/utils/date";
import { getCurrencySign } from "@/components/ui/CurrencyTypeSelect";

export type KpiFormData = {
  kpiType: string;
  name: string;
  description: string;
  ownerId: { id: string; name: string };
  measurementUnit: string;
  targetValue: string;
  divisionType: string;
  quarter: string;
  frequency: string;
  breakdown: any;
  teamId?: string;
  teamIds?: { id: string; name: string }[];
  assigneeIds?: { id: string; name: string }[];
  parentKpiId?: string;
};

export default function KpiDetailPage() {
  const { toast } = useToast();
  const { id } = useParams();
  const [kpiData, setKpiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [owners, setOwners] = useState<any>([]);
  const navigate = useNavigate();
  const [_updateHistory, setUpdateHistory] = useState<any[]>([]);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedKpiForLinking, setSelectedKpiForLinking] = useState<any>(null);
  const [matchingTeams, setMatchingTeams] = useState<any[]>([]);

  const getKpiById = async (id: string) => {
  await KpiService.getOneKpiById(id)
      .then((response:any) => {
        const data = response;
        setKpiData(data);
        return data;
      })
      .catch((error) => {
        console.error("Error fetching KPI:", error);
        setKpiData(null);
        throw error;
      });
  };

  const KpiTypePermissionsEdit: KpiTypePermissions = {
    individual: [Permission.EDIT_INDIVIDUAL_KPI],
    team: [Permission.EDIT_TEAM_KPI],
    company: [Permission.EDIT_ALL_KPI],
  };

  const getTeamOwnerById = async (id: string) => {
    try {
      const response:any = await TeamService.getTeamById(id)
      const data = response.data;
      const owner = data.owner;
      return owner;
    } catch (error) {
      console.error("Error fetching team:", error);
      throw error; // Rethrow the error for handling in the calling function
    }
  };

  useEffect(() => {
    const loadKpiData = async () => {
      setLoading(true);
      try {
        await getKpiById(id!);
        // setKpiData(data);
      } catch (error) {
        console.error("Error loading KPI:", error);
        setKpiData(null);
        setUpdateHistory([]);
        toast({
          title: "Error",
          description: "Failed to load KPI data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadKpiData();
  }, [id, toast]);

  useEffect(() => {
    if (kpiData && kpiData?.kpiType == "company") {
      kpiData.teamIds.map(async (team: any) => {
        const teamOwner = await getTeamOwnerById(team.id);
        const owner = teamOwner
          ? { id: teamOwner.id, name: teamOwner.name }
          : null;
        if (owner) {
          setOwners((prevOwners: any) => [...prevOwners, owner]);
        }
      });
    }
  }, [kpiData]);

  // Function to handle KPI data updates from the edit dialog
  const handleKpiUpdate = async (formData: any) => {
    try {
      // setKpiData({
      //   ...kpiData,
      //   title: formData.name,
      //   description: formData.description || "",
      // });
      axiosInstance
        .put(`/kpis/${id}`, formData)
        .then((response) => {
          const data = response.data;
          getKpiById(id!);
          return data;
        })
        .catch((error) => {
          console.error("Error updating KPI:", error);
          toast({
            title: "Error",
            description: "Failed to update KPI. Please try again.",
            variant: "destructive",
          });
        });
      toast({
        title: "KPI updated",
        description: "The KPI has been successfully updated",
      });
      return true;
    } catch (error) {
      console.error("Error updating KPI:", error);
      toast({
        title: "Error",
        description: "Failed to update KPI. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleProgressUpdate = async (progressData: any) => {
    try {
      axiosInstance
        .post(`/kpis/update-kpi/${id}`, progressData)
        .then((response) => {
          const data = response.data;
          getKpiById(id!);
          return data;
        })
        .catch(() => {});
      toast({
        title: "Progress updated",
        description: "KPI progress has been successfully updated",
      });
      return true;
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
      return false;
    }
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
  
      if (parentKpis.length === 0) {
        const label = kpi.kpiType === 'individual' ? 'teams' : 'companies';
        toast({
          title: `No matching ${label} found`,
          description: `No ${label} KPIs found with matching criteria (frequency, quarter, measurement unit, division type)`,
          variant: 'destructive',
        });
        return;
      }
      setSelectedKpiForLinking(kpi);
      setMatchingTeams(parentKpis); // This still works even if it’s company-level — you can rename later
      setLinkDialogOpen(true);
    } catch (error) {
      const label = kpi.kpiType === 'individual' ? 'teams' : 'companies';
      console.error(`Error fetching matching ${label}:`, error);
      toast({
        title: 'Error',
        description: `Failed to fetch matching ${label}`,
        variant: 'destructive',
      });
    }
  };

  const handleLinkKpiToParentKpi = async (teamId: string, type: string) => {
    try {
      if (["company", "team"].includes(type)) {
        await axiosInstance.post(
          `/kpis/${selectedKpiForLinking._id}/link-to-parent/${teamId}/${type}`
        );
        toast({
          title: "Successfully linked",
          description: `KPI linked to ${type} successfully`,
        });

      await axiosInstance
        .get(`/kpis/${id}`)
        .then((response) => {
          const data = response.data;
          setKpiData(data);
          return data;
        })
      }
    } catch (error) {
      console.error("Error linking KPI to team:", error);
      throw error;
    }
  };
 
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="p-4 bg-[#111111] rounded-xl mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <Skeleton className="h-6 w-48 bg-gray-800" />
              <Skeleton className="h-4 w-96 bg-gray-800 mt-2" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-md bg-gray-800" />
            <Skeleton className="h-10 w-20 rounded-md bg-gray-800" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-gray-800" />
          ))}
        </div>

        <Skeleton className="h-64 rounded-xl bg-gray-800 mb-4" />
        <Skeleton className="h-64 rounded-xl bg-gray-800" />
      </div>
    );
  }

  // Render error state if KPI data is not available
  if (!kpiData) {
    return (
      <div className="h-full bg-black text-white p-4 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">KPI Not Found</h1>
        <p className="mb-6">
          The KPI you are looking for does not exist or has been deleted.
        </p>
        <Link to="/">
          <Button className="bg-white text-black hover:bg-gray-200">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }
  // console.log("old",`${getCurrencySign(kpiData.currencyType)} ${formattedValue(kpiData.qtdAchieved)} / ${getCurrencySign(kpiData.currencyType)} ${formattedValue(kpiData.qtdGoal)}`);
  
  const calculateQtdAchieved = (breakdownData) => {
    const today = new Date();
    // Filter out current week and only keep updated weeks with valid contributions
    const validWeeks = breakdownData.filter(week => {
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
    const divisor = validWeeks.length;
    if (divisor === 0) return 0;
    const average = sum / divisor;
    return Math.round(average);
  };

  // console.log("new",`${getCurrencySign(kpiData.currencyType)} ${calculateQtdAchieved(kpiData.breakdownData)} / ${getCurrencySign(kpiData.currencyType)} ${formattedValue(kpiData.weeklyGoal)}`);
  // console.log(kpiData.divisionType);
  
  return (
    <div className="h-full bg-black text-white px-0.5 py-2 overflow-y-scroll hide-scrollbar">
      <div className="p-4 bg-[#111111] rounded-xl mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white" onClick={() => window.history.back()}>
              <ArrowLeft size={20} />
            </Button>
          <div>
            <h1 className="text-lg font-semibold">{kpiData.title}</h1>
            <div className="flex flex-col items-start gap-0 text-sm text-[#fffff]">
              {/* KPI Name */}
              <div className="text-white font-bold text-lg">{kpiData.name}</div>

              {/* KPI Details */}
              <div className="flex flex-wrap items-center gap-2">
                {/* <span>•</span>
                <span>{formatQuarter(kpiData.quarter)}</span> */}
                <span className="cursor-pointer hover:text-white text-[#BDBDBD] transition-colors duration-200">
                  {kpiData.quarter.replace("q", "Q").replace("-", " ")}
                </span>

                {kpiData.kpiType === "individual" && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="text-[#BDBDBD] hover:text-[#ffffff] transition-colors duration-200">
                      Linked To:{" "}
                      {kpiData.parentKpiId
                        ? kpiData.parentKpiName
                        : "Not Linked"}
                    </span>
                  </>
                )}

                <span>•</span>
                <span className="text-[#BDBDBD] hover:text-[#ffffff] transition-colors duration-200">
                  Owner: {kpiData.ownerId.name}
                </span>

                {kpiData.linkedTo && (
                  <>
                    <span>•</span>
                    <span>Linked To: {kpiData.linkedTo}</span>
                  </>
                )}

                <span>•</span>
                <span className="text-[#BDBDBD] hover:text-[#ffffff] transition-colors duration-200">
                  {kpiData.divisionType.charAt(0).toUpperCase() +
                    kpiData.divisionType.slice(1)}
                </span>

                {kpiData.team && (
                  <>
                    <span>•</span>
                    <span>Team: {kpiData.team}</span>
                  </>
                )}

                {kpiData.contribution && (
                  <>
                    <span>•</span>
                    <span>Contribution: {formattedValue(Number(kpiData.contribution))}%</span>
                  </>
                )}

                {kpiData?.intervalsLeft && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary">{ kpiData?.intervalsLeft}</Badge>
                  </>
                )}
                 {kpiData?.currentWeek && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary">Current Week : { kpiData?.currentWeek}</Badge>
                  </>
                )}
               {new Date(kpiData.quarterStartDate) > new Date() && (
  <>
    <span>•</span>
    <Badge variant="secondary">Quarter Not Started Yet</Badge>
  </>
)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
        {kpiData.kpiType !== "company" && (
                        <div
                          className="flex px-3 py-2 bg-[#ffffff] text-black rounded-md hover:bg-gray-500"
                          onClick={(e) => {
                            e.stopPropagation();

                            if (kpiData.parentKpiId) {
                              toast({
                                title: "Already Linked",
                                description: "KPI is already linked",
                                variant: "destructive",
                              });
                            } else {
                              if ([ "team","individual"].includes(kpiData.kpiType)) {
                                handleFetchKpiLinkToParentKpi(kpiData);
                              } else {
                                // fallback if needed for other kpiTypes
                                console.warn(
                                  "Unhandled KPI type:",
                                  kpiData.kpiType
                                );
                              }
                            }
                          }}
                        >
                          <div className="flex items-center justify-center rotate-90 ">
                            <Link2 size={20} />
                          </div>
                        </div>
                      )}
          <AccessControl
            requiredPermissions={
              KpiTypePermissionsEdit[kpiData.kpiType as keyof KpiTypePermissions]
            }
          >
            <Button
              className="bg-white text-black hover:bg-gray-200"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </AccessControl>

          {kpiData.kpiType === "individual" && (
            <Button
              className="bg-white text-black hover:bg-gray-200"
              onClick={() => setUpdateDialogOpen(true)}
            >
              Update
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-[#111111] p-4 rounded-xl">
          <div className="text-sm text-gray-400">Quarterly Goal</div>
          <div className="text-xs text-gray-500">Target To Be Achieved</div>
          <div className="text-2xl font-bold mt-2">
            {/* {kpiData.quarterlyGoal} */}
            {` ${getCurrencySign(kpiData.currencyType)} ${Math.floor(kpiData.quarterlyGoal)}`}
            {/* {formattedValue(kpiData.quarterlyGoal)} */}
          </div>
        </div>
        <div className="bg-[#111111] p-4 rounded-xl">
          <div className="text-sm text-gray-400">QTD Goal</div>
          <div className="text-xs text-gray-500">
            Target To Be Achieved till Date
          </div>
          <div className="text-2xl font-bold mt-2">
            {/* {kpiData.qtdGoal.toFixed(2)} */}
            {/* {formattedValue(kpiData.qtdGoal)} */}
            {`${getCurrencySign(kpiData.currencyType)} ${formattedValue(kpiData.qtdGoal)}`}
          </div>
        </div>
        <div className="bg-[#111111] p-4 rounded-xl">
          <div className="text-sm text-gray-400">QTD Achieved</div>
          <div className="text-xs text-gray-500">Target achieved till date</div>
          <div className="text-2xl font-bold mt-2">
            {/* {kpiData.qtdAchieved}/{kpiData.qtdGoal.toFixed(2)} */}
            {/* {formattedValue(kpiData.qtdAchieved)}/{formattedValue(kpiData.qtdGoal)} */}
            {kpiData.divisionType === 'cumulative' ?(
              `${getCurrencySign(kpiData.currencyType)} ${formattedValue(kpiData.qtdAchieved)} / ${getCurrencySign(kpiData.currencyType)} ${formattedValue(kpiData.qtdGoal)}`
            ) : ''}
            {kpiData.divisionType === 'standalone' ?(
              `${getCurrencySign(kpiData.currencyType)} ${calculateQtdAchieved(kpiData.breakdownData)} / ${getCurrencySign(kpiData.currencyType)} ${formattedValue(kpiData.weeklyGoal)}`
            ):''}
            {/* {`${getCurrencySign(kpiData.currencyType)} ${calculateQtdAchieved(kpiData.breakdownData, kpiData.currentWeek)} / ${getCurrencySign(kpiData.currencyType)} ${formattedValue(kpiData.weeklyGoal)}`} */}
          </div>
        </div>
        <div className="bg-[#111111] p-4 rounded-xl">
          <div className="text-sm text-gray-400">Weekly Goal</div>
          <div className="text-xs text-gray-500">Weekly Target</div>
          <div className="text-2xl font-bold mt-2">
            {kpiData.divisionType === "standalone"
               ? `${getCurrencySign(kpiData.currencyType)} ${formattedValue(kpiData.currentWeekAchieved)} / ${getCurrencySign(kpiData.currencyType)} ${formattedValue(
                  kpiData.weeklyGoal
                )}`
              : `${getCurrencySign(kpiData.currencyType)} ${formattedValue(kpiData.currentWeekAchieved)} / ${getCurrencySign(kpiData.currencyType)} ${formattedValue(
                  kpiData.weeklyGoal
                )}`}
          </div>
        </div>
      </div>

      {kpiData.kpiType !== "individual" && (
        <div className="bg-[#111111] rounded-xl mb-4 overflow-y-scroll max-h-[19.6875rem] hide-scrollbar ">
          {kpiData.departments?.length > 0 ||
          kpiData.individuals?.length > 0 ||
          kpiData.assigneeIds?.length > 0 ||
          kpiData.breakdownData?.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border border-[#252525]">
                  <th className="py-4 px-0 text-center text-sm font-medium border border-[#252525] ">
                    S.NO
                  </th>
                  <th className="p-4 text-left text-sm font-medium border border-[#252525]">
                    {kpiData.kpiType === "team"
                      ? "Individual KPI"
                      : "Department KPI"}
                  </th>
                  <th className="p-4 text-center text-sm font-medium border border-[#252525]">
                    Select Owner
                  </th>
                  <th className="p-4 text-center text-sm font-medium border border-[#252525]">
                    Contribution
                  </th>
                  <th className="p-4 text-center text-sm font-medium border border-[#252525]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="w-full ">
                {kpiData.kpiType === "team" || kpiData.kpiType === "company" ? (
                  kpiData.childKpis?.length > 0 ? (
                    kpiData.childKpis.map((kpi: any, index: number) => {
                      // Check if the item is assigned to the team
                      if (
                        kpiData.kpiType === "team" &&
                        !kpiData.assigneeIds.some(
                          (data: any) => data.id === kpi?.ownerId?.id
                        )
                      ) {
                        return (
                          <tr key={`no-kpi-${index}`}>
                            <td colSpan={5} className="p-8 text-center">
                              <div className="w-full flex flex-col items-center justify-center p-2 rounded-lg">
                                <div className="text-xl font-medium text-gray-100 mb-2">
                                  KPIs Not Assigned
                                </div>
                                <p className="text-gray-200">
                                  No KPIs have been assigned for this{" "}
                                  {kpiData.kpiType} yet.
                                </p>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      // // Calculate total contribution and target
                      // const totalContribution = kpi.breakdownData.reduce(
                      //   (sum: number, interval: any) =>
                      //     sum +
                      //     parseFloat(interval.intervalContribution || "0"),
                      //   0
                      // );

                      // const totalTarget = kpi.breakdownData.reduce(
                      //   (sum: number, interval: any) =>
                      //     sum + parseFloat(interval.intervalTarget || "0"),
                      //   0
                      // );
                      // Calculate progress percentage
                      const achieved = Number(kpi.qtdAchieved);
                      const target = Number(kpi.targetValue);
                      const progress = target > 0 && !isNaN(achieved)
                  ? Math.min(100, Math.max(0, (achieved / target) * 100))
                  : 0;

                      return (
                        <tr key={kpi._id} className="border border-[#252525]">
                          <td className="py-4 px-0 text-sm border border-[#252525] text-center">
                            {index + 1}
                          </td>
                          <td
                            className="p-4 text-sm border border-[#252525] cursor-pointer"
                            onClick={() => navigate(`/kpi/${kpi._id}`)}
                          >
                            {kpi.kpiName || kpi.name}
                          </td>
                          <td className="p-4 border border-[#252525]">
                            <div className="flex justify-center ">
                              <TooltipProvider>
                                <Tooltip2>
                                  <TooltipTrigger asChild>
                                    <Avatar className="h-8 w-8 bg-gray-700 flex items-center cursor-pointer justify-center">
                                      <span className="text-xs">
                                        {kpiData.kpiType === "company"
                                          ? owners[index]?.name
                                              ?.split(" ")
                                              .map((n: string) => n[0])
                                              .join("") || "NA"
                                          : kpi.ownerId.name
                                              ?.split(" ")
                                              .map((n: string) => n[0])
                                              .join("") || "NA"}
                                      </span>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {kpiData.kpiType === "company"
                                        ? owners[index]?.name
                                        : kpi?.ownerId?.name}
                                    </p>
                                  </TooltipContent>
                                </Tooltip2>
                              </TooltipProvider>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-center border border-[#252525]">
                            {kpi.contribution
                              ? `${Number(kpi.contribution).toFixed(2)}%`
                              : "0.00%"}
                            {/* // `${parseFloat(item.contribution).toFixed(2)}%`
                              // : "0.00%"} */}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center">
                              <TooltipProvider>
                                <Tooltip2>
                                  <TooltipTrigger asChild>
                                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                                        style={{
                                          width: `${Math.min(progress, 100)}%`,
                                        }}
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{progress.toFixed(1)}%</p>
                                  </TooltipContent>
                                </Tooltip2>
                              </TooltipProvider>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center">
                        <div className="w-full flex flex-col items-center justify-center p-2 rounded-lg">
                          <div className="text-xl font-medium text-gray-100 mb-2">
                            KPIs Not Assigned
                          </div>
                          <p className="text-gray-200">
                            No KPIs have been assigned for this{" "}
                            {kpiData.kpiType} yet.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="bg-red-500 w-full flex flex-col items-center justify-center p-6 rounded-lg">
                        <div className="text-xl font-medium text-gray-100 mb-2">
                          KPIs Not Assigned
                        </div>
                        <p className="text-gray-200">
                          No KPIs have been assigned for this {kpiData.kpiType}{" "}
                          yet.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <div className="text-xl font-medium text-gray-400 mb-2">
                KPIs Not Assigned
              </div>
              <p className="text-gray-500">
                No KPIs have been assigned for this {kpiData.kpiType} yet.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-medium mb-2">Target BreakDown</h2>
        <div className="bg-[#111111] rounded-xl overflow-auto max-h-[16.5rem]">
          {kpiData.breakdownData && kpiData.breakdownData?.length > 0 ? (
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b-2 border-[#111111]">
                  <th className="p-4 text-left text-sm font-medium">Name</th>
                  {kpiData.breakdownData?.map((interval: any, i: number) => (
                    <th key={i} className="p-4 text-center text-sm font-medium">
                      {interval.intervalName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kpiData.kpiType === "team" &&
                kpiData.assigneeIds.length === 0 ? (
                  <tr>
                    <td
                      colSpan={1 + (kpiData.childKpis.length || 0)}
                      className="p-4 text-sm text-center text-gray-500"
                    >
                      No KPI assigned
                    </td>
                  </tr>
                ) : kpiData.breakdownData.length > 0 ? (
                  (kpiData.kpiType === "team" || kpiData.kpiType === "company"
                    ? kpiData.childKpis
                    : [kpiData]
                  )
                    .filter((item: any) =>
                      kpiData.kpiType === "team"
                        ? kpiData.assigneeIds.some(
                            (data: any) =>
                              String(data.id) === String(item.ownerId.id)
                          )
                        : true
                    )
                    .map((item: any, index: number) => (
                      <tr key={index} className="border-b border-[#111111]">
                        <td className="p-4 text-sm bg-[#080808] border-r-4 border-[#111111]">
                          {item.name}
                        </td>
                        {item.breakdownData.map((interval: any, i: number) => {
                          const value = Number.parseFloat(
                            interval.intervalContribution
                          );
                          const bgColor = getColorByPercentage(value,interval.intervalTarget,interval?.isUpdated);
                          const textColor = getTextColor(bgColor);

                          return (
                            <td
                              key={i}
                              className={`p-4 py-6 text-sm text-center border-r-4 border-[#111111]  ${bgColor} ${textColor}`}
                            >
                              <div>
                               {/* {formattedValue(Number(value))}*/}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>{formattedValue(Number(value))}</div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" align="center" className="max-w-[300px]">
                                    <p className="text-sm">
                                      {interval?.notes || "No notes available"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan={1 + (kpiData.breakdownData?.length || 0)}
                      className="p-4 text-sm text-center text-gray-500"
                    >
                      No KPI assigned
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <div className="text-xl font-medium text-gray-400 mb-2">
                KPIs Not Assigned
              </div>
              <p className="text-gray-500">
                No target breakdown data is available for this KPI.
              </p>
            </div>
          )}
        </div>
      </div>

      {kpiData.kpiType === "individual" && kpiData.breakdownData && (
        <div className="">
          <LineGraph
            data={kpiData}
            width={"100%"}
            height={"100%"}
            showLegend={false}
          />
        </div>
      )}
      {/* Edit KPI Dialog */}
      {kpiData && editDialogOpen && (
        <AddKpiDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          initialData={kpiData}
          isEditMode={true}
          kpiType={kpiData.kpiType}
          onSave={handleKpiUpdate}
        />
      )}

      {/* Update KPI Dialog - Only for individual KPIs */}
      {kpiData.kpiType === "individual" && (
        <UpdateKpiDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          kpiData={kpiData}
          onUpdate={handleProgressUpdate}
        />
      )}

       <LinkKpiDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        matchingTeams={matchingTeams}
        onLink={handleLinkKpiToParentKpi}
       selectedLinkingType={kpiData.kpiType}             
            />
    </div>
  );
}
