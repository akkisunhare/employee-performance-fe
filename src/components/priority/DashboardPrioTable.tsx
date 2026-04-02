import { QuarterService } from "@/services/quaterService";
import { week } from "@/utils/dashboardUtills";
import { useEffect, useState } from "react";

const getStatusColor = (status) => {
  switch (status) {
    case "On track":
      return "bg-green-500";
    case "Behind schedule":
      return "bg-yellow-400";
    case "Not yet started":
      return "bg-red-500";
    case "Complete":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

const DashboardPriorityTable = ({ data = [], quarter, userId }) => {
  // Check if a date is in the current quarter
  const isCurrentQuarter = (date) => {
    if (!date) return false;
    const now = new Date();
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const quarterEnd = new Date(quarterStart);
    quarterEnd.setMonth(quarterStart.getMonth() + 3);
    return new Date(date) >= quarterStart && new Date(date) < quarterEnd;
  };

  // Get current week index based on the first priority's week data
  const getCurrentWeekIndex = (weekStatusdata) => {
    if (!weekStatusdata || weekStatusdata.length === 0) return -1;
    
    const today = new Date();
    const currentWeek = weekStatusdata.find((week) => {
      if (!week.startDate || !week.endDate) return false;
      const weekStart = new Date(week.startDate);
      const weekEnd = new Date(week.endDate);
      return today >= weekStart && today <= weekEnd;
    });
    return currentWeek ? currentWeek.intervalIndex : -1;
  };

  // Generate week headers based on current week or last 5 weeks for previous quarter
  const generateWeekHeaders = (priority) => {
    const isCurrent = isCurrentQuarter(priority.endWeek?.endDate) || 
                      isCurrentQuarter(priority.startWeek?.startDate);
    
    if (!isCurrent) {
      // For previous quarter, show last 5 weeks
      return Array.from({ length: 5 }).map((_, i) => `Week ${i + 1}`);
    }

    const currentWeekIndex = getCurrentWeekIndex(priority.weekStatusdata);
    const headers = [];
    
    if (currentWeekIndex === -1) {
      // Fallback to showing first 5 weeks if current week not found
      return Array.from({ length: 5 }).map((_, i) => `Week ${i + 1}`);
    }
    // Show current week and previous 4 weeks
    const startIndex = Math.max(0, currentWeekIndex - 4);
    const endIndex = currentWeekIndex;
    for (let i = startIndex; i <= endIndex; i++) {
      headers.push(`Week ${i + 1}`);
    }
    // Pad with empty weeks if needed
    while (headers.length < 5) {
      headers.unshift(`Week ${headers.length + 1}`);
    }
    return headers;
  };

  // Get the week status data for display
  const getDisplayWeekData = (priority) => {
    const weekStatusdata = priority.weekStatusdata || [];
    const isCurrent = isCurrentQuarter(priority.endWeek?.endDate) || 
                      isCurrentQuarter(priority.startWeek?.startDate);

    if (!isCurrent) {
      // For previous quarter, show last 5 weeks
      return weekStatusdata
        .sort((a, b) => b.intervalIndex - a.intervalIndex)
        .slice(0, 5)
        .sort((a, b) => a.intervalIndex - b.intervalIndex);
    }

    const currentWeekIndex = getCurrentWeekIndex(weekStatusdata);
    
    if (currentWeekIndex === -1) {
      return weekStatusdata.slice(0, 5);
    }
    
    const startIndex = Math.max(0, currentWeekIndex - 4);
    const endIndex = currentWeekIndex;
    const displayData = [];
    
    for (let i = startIndex; i <= endIndex; i++) {
      displayData.push(weekStatusdata.find(w => w.intervalIndex === i) || null);
    }
    // Pad with null if we don't have 5 weeks
    while (displayData.length < 5) {
      displayData.unshift(null);
    }
    return displayData;
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
    
  const getLast5WeekDataPrio = (breakdownData) => {
    if (!breakdownData || breakdownData.length === 0) return Array(5).fill({});
    const lastFive = breakdownData.slice(-5); // Get last 5 items
    // Pad with empty objects if less than 5
    while (lastFive?.length < 5) {
      lastFive.unshift({});
    }
    return lastFive;
  };

  return (
    <div className="bg-[#121212] text-white rounded-xl p-4 overflow-auto mt-5">
      <div className="mb-5">
        <span className="px-4 py-2 bg-[#000] rounded-md font-medium">
          Priorities
        </span>
      </div>
      <div className="overflow-hidden relative ">
        <div className="overflow-y-auto hide-scrollbar max-h-[260px] custom-scroll-container">
          <table className="w-full text-m border-collapse mainTable">
            <thead className="text-sm border-b border-gray-600 sticky top-0 bg-[#121212] z-50">
              <tr>
                <th className="px-4 py-2 min-w-[100px] max-w-[100px] text-left">
                  Quarterly Priorities
                </th>
                <th className="px-4 py-2 min-w-[60px] max-w-[60px] text-left">
                  Start Date
                </th>
                <th className="px-4 py-2 min-w-[60px] max-w-[60px] text-left">
                  Due Date
                </th>
                <th className="px-4 py-2 min-w-[60px] max-w-[60px] text-left">
                  Last Notes
                </th>
                {currentQuarter &&( data?.length > 0 ? generateWeekHeaders(data[0]).map((header, i) => (
                  <th
                    key={i}
                    className="px-2 py-2 min-w-[80px] max-w-[80px] text-center"
                  >
                    {header}
                  </th>
                )) : Array.from({ length: 5 }).map((_, i) => (
                  <th
                    key={i}
                    className="px-2 py-2 min-w-[80px] max-w-[80px] text-center"
                  >
                    Week 
                  </th>
                )))}
                {/* Previous Week header */}
                {!currentQuarter && weeks?.map((header: any, i) => (
                  <th
                    key={i}
                    className="px-2 py-2 min-w-[80px] max-w-[80px] text-center"
                  >
                    {header.label}
                  </th>
                ))}
                {/* Previous Week header end */}
              </tr>
            </thead>
            <tbody className="bg-[#000000]">
              {data.map((priority, idx) => {
                const start = priority.startWeek?.startDate
                  ? new Date(priority.startWeek.startDate)
                  : null;
                const end = priority.endWeek?.endDate
                  ? new Date(priority.endWeek.endDate)
                  : null;
                const displayWeekData = getDisplayWeekData(priority);
                // const headers = generateWeekHeaders(priority);
                const display5WeekData = getLast5WeekDataPrio(priority.weekStatusdata);
                return (
                  <tr key={idx} className="border-b border-gray-700">
                    <td className="px-4 py-2 min-w-[100px] max-w-[100px] text-left align-middle truncate">
                      {priority.name}
                    </td>
                    <td className="px-4 py-2 min-w-[60px] max-w-[60px] text-left align-middle truncate">
                      {start
                        ? start
                            .toLocaleString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })
                            .replace(" ", "")
                        : "-"}
                    </td>
                    <td className="px-4 py-2 min-w-[60px] max-w-[60px] text-left align-middle truncate">
                      {end
                        ? end
                            .toLocaleString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })
                            .replace(" ", "")
                        : "-"}
                    </td>
                    <td className="px-4 py-2 min-w-[100px] max-w-[100px] text-left align-middle truncate">
                      {(() => {
                        const weekData = priority.weekStatusdata || [];
                        if (weekData?.length === 0) return "No notes";
                        if (currentQuarter) {
                          // find current week index
                          const currentIdx = getCurrentWeekIndex(weekData);
                          if (currentIdx > 0) {
                            const lastWeek = weekData.find(w => w.intervalIndex === currentIdx - 1);
                            return lastWeek?.description || "No notes";
                          }
                          return "No notes";
                        } else {
                          // previous quarter → last available week
                          const lastWeek = [...weekData].sort((a, b) => b.intervalIndex - a.intervalIndex)[0];
                          return lastWeek?.description || "No notes";
                        }
                      })()}
                    </td>
                    {currentQuarter && displayWeekData.map((weekStatus, i) => {
                      const bgColor = weekStatus
                        ? getStatusColor(weekStatus.status)
                        : "bg-gray-500";
                      return (
                        <td
                          key={i}
                          className="px-2 py-1 min-w-[80px] max-w-[80px] text-left align-middle"
                        >
                          <div
                            className={`h-8 w-full rounded-sm flex items-center justify-center ${bgColor} truncate`}
                            title={
                              weekStatus?.description || "No notes"
                            }
                          >
                            {weekStatus?.label || ""}
                          </div>
                        </td>
                      );
                    })}

                    {/* Previous Week Data */}
                    {!currentQuarter && display5WeekData.map((weekStatus, i) => {
                      const bgColor = weekStatus
                        ? getStatusColor(weekStatus.status)
                        : "bg-gray-500";
                      return (
                        <td
                          key={i}
                          className="px-2 py-1 min-w-[80px] max-w-[80px] text-left align-middle"
                        >
                          <div
                            className={`h-8 w-full rounded-sm flex items-center justify-center ${bgColor} truncate`}
                            title={
                              weekStatus?.description || "No notes"
                            }
                          >
                            {weekStatus?.label || ""}
                          </div>
                        </td>
                      );
                    })}
                    {/* Previous Week DAta end*/}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPriorityTable;
