import { cn } from "@/lib/utils";
import { QuarterService } from "@/services/quaterService";
import { week } from "@/utils/dashboardUtills";
import { useEffect, useState } from "react";

const getWeekLabelColor = (interval) => {
  if (!interval) return "bg-gray-500";

  // Handle cases where target is 0
  if (interval.intervalTarget === 0) {
    return interval.intervalContribution === 0 ? "bg-gray-500" : "bg-blue-500";
  }

  const percentage =
    (interval.intervalContribution / interval.intervalTarget) * 100;
    // Apply same color coding to weekly cells
    if (percentage >= 120) return "bg-blue-500";
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

const DashboardKpiTable = ({ data = [], quarter, userId }) => {
  // Get current week index
  const getCurrentWeekIndex = (breakdownData) => {
    if (!breakdownData || breakdownData.length === 0) return -1;
    const today = new Date();
    return breakdownData.findIndex((week) => {
      const weekStart = new Date(week.startDate);
      const weekEnd = new Date(week.endDate);
      return today >= weekStart && today <= weekEnd;
    });
  };

  // Generate week headers based on current week
  const generateWeekHeaders = () => {
    if (data.length === 0)
      return Array.from({ length: 5 }).map((_, i) => `Week ${i + 1}`);
    // Find the first KPI with breakdown data
    const kpiWithData = data.find(
      (kpi) => kpi.breakdownData && kpi.breakdownData.length > 0
    );
    if (!kpiWithData)
      return Array.from({ length: 5 }).map((_, i) => `Week ${i + 1}`);
    const currentWeekIndex = getCurrentWeekIndex(kpiWithData.breakdownData);
    if (currentWeekIndex === -1)
      return Array.from({ length: 5 }).map((_, i) => `Week ${i + 1}`);
    const headers = [];
    for (
      let i = Math.max(0, currentWeekIndex - 4);
      i <= currentWeekIndex;
      i++
    ) {
      headers.push(`Week ${i + 1}`);
    }
    // If we don't have 5 weeks, pad with future weeks
    while (headers.length < 5) {
      headers.push(`Week ${headers.length + 1}`);
    }
    return headers;
  };
  const weekHeaders = generateWeekHeaders();

  // const getQTDGoal = (breakdownData, divisionType) => {
  //   if (!breakdownData || breakdownData.length === 0) return 0;
  //   if (divisionType === "standalone") {
  //     const today = new Date();
  //     const currentWeek = breakdownData.find((week) => {
  //       const weekStart = new Date(week.startDate);
  //       const weekEnd = new Date(week.endDate);
  //       return today >= weekStart && today <= weekEnd;
  //     });
  //     return currentWeek?.intervalTarget || 0;
  //   }
  //   const today = new Date();
  //   return breakdownData.reduce((sum, week) => {
  //     const weekEnd = new Date(week.endDate);
  //     return weekEnd < today ? sum + (week.intervalTarget || 0) : sum;
  //   }, 0);
  // };

  const getQTDGoalNew = (breakdownData, divisionType) => {
    if (!breakdownData || breakdownData.length === 0) return 0;
    const today = new Date();
    const currentWeekIndex = breakdownData.findIndex((week) => {
      const weekStart = new Date(week.startDate);
      const weekEnd = new Date(week.endDate);
      return today >= weekStart && today <= weekEnd;
    });
    // If current week not found (date not in range), assume all weeks are past
    const lastIndex =
      currentWeekIndex === -1 ? breakdownData.length : currentWeekIndex;
    if (divisionType === "standalone") {
      // Just last previous week’s target
      return lastIndex > 0
        ? breakdownData[lastIndex - 1].intervalTarget || 0
        : 0;
    } else {
      // Sum of all previous weeks’ targets
      return breakdownData
        .slice(0, lastIndex)
        .reduce((sum, week) => sum + (week.intervalTarget || 0), 0);
    }
  };

  // const getWeeklyGoal = (breakdownData, divisionType) => {
  //   if (!breakdownData || breakdownData.length === 0) return 0;
  //   if (divisionType === "standalone") {
  //     const today = new Date();
  //     const currentWeek = breakdownData.find((week) => {
  //       const weekStart = new Date(week.startDate);
  //       const weekEnd = new Date(week.endDate);
  //       return today >= weekStart && today <= weekEnd;
  //     });
  //     return currentWeek?.intervalTarget || 0;
  //   }
  //   const today = new Date();
  //   const currentWeekIndex = breakdownData.findIndex((week) => {
  //     const weekStart = new Date(week.startDate);
  //     const weekEnd = new Date(week.endDate);
  //     return today >= weekStart && today <= weekEnd;
  //   });
  //   return currentWeekIndex > 0
  //     ? breakdownData[currentWeekIndex - 1].intervalTarget || 0
  //     : breakdownData[0].intervalTarget || 0;
  // };

  const getWeeklyGoalNew = (breakdownData) => {
    if (!breakdownData || breakdownData.length === 0) return 0;
    const today = new Date();
    const currentWeekIndex = breakdownData.findIndex((week) => {
      const weekStart = new Date(week.startDate);
      const weekEnd = new Date(week.endDate);
      return today >= weekStart && today <= weekEnd;
    });
    return currentWeekIndex > 0
      ? breakdownData[currentWeekIndex - 1].intervalTarget || 0
      : breakdownData[0].intervalTarget || 0;
  };

  // Get the week data for display (current week and previous 4)
  const getDisplayWeekData = (breakdownData) => {
    if (!breakdownData || breakdownData.length === 0) return Array(5).fill({});
    const today = new Date();
    const currentWeekIndex = breakdownData.findIndex((week) => {
      const weekStart = new Date(week.startDate);
      const weekEnd = new Date(week.endDate);
      return today >= weekStart && today <= weekEnd;
    });
    if (currentWeekIndex === -1) return breakdownData.slice(0, 5);
    const startIndex = Math.max(0, currentWeekIndex - 4);
    const endIndex = currentWeekIndex;
    const weekData = [];
    // Add previous weeks
    for (let i = startIndex; i <= endIndex; i++) {
      weekData.push(breakdownData[i] || {});
    }
    // Pad with empty objects if we don't have 5 weeks
    while (weekData.length < 5) {
      weekData.unshift({});
    }
    return weekData;
  };

  const [currentQuarter, setCurrentQuarter] = useState(true);
  const [currentQuarter1, setCurrentQuarter1] = useState(quarter);
  const [weeks, setWeeks] = useState([]);

  const quarterData = async () => {
    try {
      const yearStr = new Date().getFullYear().toString();
      const response: any = await QuarterService.getCurrentYearQuaters(yearStr);
      if (response?.data) {
        const today = new Date();
        const now = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        let currentQuarterValue = "";
        for (let i = 0; i < response?.data?.length; i++) {
          const quarter = response.data[i];
          const quarterStart = new Date(quarter.start_date);
          const quarterEnd = new Date(quarter.end_date);
          if (now >= quarterStart && now <= quarterEnd) {
            currentQuarterValue = `${quarter?.quarter}-${quarter?.year}`;
            setCurrentQuarter1(currentQuarterValue);
            break;
          }
        }
        // Set current quarter for both dropdowns
      }
    } catch (error) {
      console.error("Error fetching quarter data:", error);
    }
  };

  useEffect(() => {
    quarterData();
  }, [userId]); // just fetch quarter data once per user change

  useEffect(() => {
    if (!currentQuarter1) return;
    if (quarter === currentQuarter1) {
      setCurrentQuarter(true);
    } else {
      setWeeks(week);
      setCurrentQuarter(false);
    }
  }, [quarter, currentQuarter1]);

  const getLast5WeekData = (breakdownData) => {
    if (!breakdownData || breakdownData.length === 0) return Array(5).fill({});
    const lastFive = breakdownData.slice(-5); // Get last 5 items
    // Pad with empty objects if less than 5
    while (lastFive?.length < 5) {
      lastFive.unshift({});
    }
    return lastFive;
  };

  const getColorByPercentage = (achieved: number, target: number): string => {
    if (!target || target === 0) return "bg-gray-500"; // handle divide-by-zero
    const percentage = (achieved / target) * 100;
    if (percentage > 120) return "bg-blue-500";         // > 120%
    if (percentage >= 100 && percentage <= 120) return "bg-green-500"; // 100–119%
    if (percentage >= 80 && percentage < 100) return "bg-yellow-500";  // 80–99%
    return "bg-red-500";                                // < 80%
  };

  const calculateQtdAchieved = (data) => {    
    const today = new Date();
    // Filter out current week and only keep updated weeks with valid contributions
    const validWeeks = data?.breakdownData?.filter(week => {
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
    if (data?.divisionType === "standalone") {
      const divisor = validWeeks?.length;
      if (divisor === 0) return 0;
      const average = sum / divisor;
      return Math.round(average);
    } else { 
      return sum;       // If kpi is break for some point then use this 13-08-25 
    }
  };

  return (
    <div className="bg-[#121212] text-white rounded-xl p-4 overflow-auto mt-5">
      <div className="mb-5">
        <span className="px-4 py-2 bg-[#000] rounded-md font-medium">KPIs</span>
      </div>
      <div className="overflow-auto max-h-[320px] custom-scroll-container">
        <table className="w-full text-m text-left mainTable">
          <thead className="text-sm border-b border-gray-600 sticky top-0 bg-[#121212] z-10">
            <tr>
              <th className="px-3 py-2 w-[210px] text-left">KPI name</th>
              <th className="px-3 py-2 text-left">KPI Type</th>
              <th className="px-3 py-2 text-left">Measurement Unit</th>
              <th className="px-3 py-2 text-left">Quarterly Goal</th>
              <th className="px-3 py-2 text-left">QTD Goal</th>
              <th className="px-3 py-2 text-left">QTD Achieved</th>
              <th className="px-3 py-2 text-left">Weekly Goal</th>
              <th className="px-3 py-2 w-[210px] text-left">Last Notes</th>
              {currentQuarter &&
                weekHeaders.map((header, idx) => (
                  <th
                    key={idx}
                    className="px-2 py-2 whitespace-nowrap w-[100px] text-left"
                  >
                    {header}
                  </th>
                ))
              }
              {/* Previous Week Header */}
              {!currentQuarter &&
                weeks.map((week, index) => (
                  <th key={index} className="px-2 py-2 whitespace-nowrap w-[100px] text-left">
                    {week.label}
                  </th>
                ))
              }
            </tr>
          </thead>
          <tbody className="bg-[#000000] overflow-x-scroll">
            {data.map((kpi, i) => {              
              // const qtdGoal = getQTDGoal(kpi.breakdownData, kpi.divisionType);
              const qtdGoal = getQTDGoalNew(kpi.breakdownData, kpi.divisionType);
              const displayWeekData = getDisplayWeekData(kpi.breakdownData);
              const display5WeekData = getLast5WeekData(kpi.breakdownData);

              return (
                <tr key={i} className="border-b border-gray-700">
                  <td className="px-3 py-2 w-[210px] text-left" title={kpi?.name}>
                    {kpi.name?.length > 20
                      ? `${kpi.name.slice(0, 20)}...`
                      : kpi.name || "No data"}</td>
                  <td className="px-3 py-2 text-left">{kpi.divisionType}</td>
                  <td className="px-3 py-2 text-left">
                    {kpi.measurementUnit === "number" ? "Number" : "Percentage"}
                  </td>
                  <td className="px-3 py-2 text-left">{kpi.targetValue}</td>
                  {/* <td className="px-3 py-2 text-left">{qtdGoal || kpi.targetValue}</td> */}
                  <td className="px-3 py-2 text-left">{qtdGoal}</td>
                  <td className="px-3 py-2 text-left">
                    <span
                      className={cn(
                        "text-white px-3 py-1 rounded text-center inline-block min-w-[50px] w-[80px] max-w-[100px]",
                        kpi.divisionType === 'cumulative' ? getColorByPercentage(kpi.qtdAchieved ,qtdGoal)
                          // : getColorByPercentage(calculateQtdAchieved(kpi) ,qtdGoal || kpi.targetValue)
                          : getColorByPercentage(calculateQtdAchieved(kpi) ,qtdGoal)
                      )}
                    >
                    {Number.isInteger(kpi.qtdAchieved) && kpi.divisionType == 'cumulative'
                      ? (kpi.qtdAchieved)
                      : calculateQtdAchieved(kpi) }
                      </span>
                  </td>
                  <td className="px-3 py-2 text-left">
                    {/* {getWeeklyGoal(kpi.breakdownData, kpi.divisionType)} */}
                    {getWeeklyGoalNew(kpi.breakdownData)}
                  </td>
                  {/* <td className="px-3 py-2 text-left">
                    {(() => {
                      const weekData = kpi.breakdownData || [];
                      if (weekData?.length === 0) return "No notes";
                      if (currentQuarter) {
                        // find current week index
                        const currentIdx = getCurrentWeekIndex(weekData);
                        if (currentIdx > 0) {
                          const lastWeek = weekData.find(w => w.intervalIndex === currentIdx - 1);
                          return lastWeek?.notes || "No notes";
                        }
                        return "No notes";
                      } else {
                        // previous quarter → last available week
                        const lastWeek = [...weekData].sort((a, b) => b.intervalIndex - a.intervalIndex)[0];
                        return lastWeek?.notes || "No notes";
                      }
                    })()}
                  </td> */}
                  <td className="px-3 py-2 text-left">
                    {(() => {
                      const weekData = kpi.breakdownData || [];
                      let notes = "No notes";
                      if (weekData?.length > 0) {
                        if (currentQuarter) {
                          // find current week index
                          const currentIdx = getCurrentWeekIndex(weekData);
                          if (currentIdx > 0) {
                            const lastWeek = weekData.find(w => w.intervalIndex === currentIdx - 1);
                            notes = lastWeek?.notes || "No notes";
                          }
                        } else {
                          // previous quarter → last available week
                          const lastWeek = [...weekData].sort((a, b) => b.intervalIndex - a.intervalIndex)[0];
                          notes = lastWeek?.notes || "No notes";
                        }
                      }
                      // Show truncated notes with tooltip
                      const displayText = notes?.length > 20 ? notes.substring(0, 20) + "..." : notes;
                      return (
                        <span title={notes}>
                          {displayText}
                        </span>
                      );
                    })()}
                  </td>

                  {currentQuarter && 
                    displayWeekData.map((weekData, idx) => {
                    const achieved = weekData.intervalContribution || 0;
                    return (
                      <td key={idx} className="px-2 py-1 w-[100px]">
                        <span
                          className={cn(
                            "text-white px-3 py-1 rounded text-center inline-block min-w-[50px] w-[80px] max-w-[100px]",
                            getWeekLabelColor(weekData)
                          )}
                          title={weekData?.notes || "No notes"}
                        >
                          {achieved}
                        </span>
                      </td>
                    );
                  })}

                  {/* Previous Quarter week data */}
                  { !currentQuarter &&
                  display5WeekData.map((weekData, idx) => {
                    const achieved = weekData.intervalContribution || 0;
                    return (
                      <td key={idx} className="px-2 py-1 w-[120px]">
                        <span
                          className={cn(
                            "text-white px-3 py-1 rounded text-center inline-block min-w-[50px] w-[80px] max-w-[100px]",
                            getWeekLabelColor(weekData)
                          )}
                          title={weekData?.notes || "No notes"}
                        >
                          {achieved}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardKpiTable;
