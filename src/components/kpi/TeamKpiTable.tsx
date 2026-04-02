import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const getColor = (achieved: number, target: number): string => {
  if (achieved === target) return "bg-green-500";
  if (achieved === 0) return "bg-red-500";
  return "bg-yellow-400";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const DashboardKpiCard = ({ kpiData }: { kpiData: any[] }) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
        <div className="space-y-4 mt-4">
        {kpiData.map((kpi, index) => (
            <div key={index} className="rounded-xl p-4 bg-[#111111] text-white">
            {/* Header Section */}
            <div className="flex justify-between items-center mt-4">
                <div>
                <p className="text-lg font-semibold">{kpi.teamId.name}</p>
                <div className="text-sm text-gray-400 space-x-2">
                    <span>{kpi.quarter.toUpperCase()}</span>
                    <span>• Owner: {kpi.ownerId?.name || "N/A"}</span>
                    <span>• Link To: Not Linked</span>
                    <span>• Standalone</span>
                    <span>• Contribution: {kpi.contribution}%</span>
                    <span className="bg-gray-700 px-2 py-1 rounded-full text-xs">
                    08 Days Left
                    </span>
                </div>
                </div>
                <button
                className="bg-gray-800 p-1 rounded-full text-lg"
                onClick={() => toggleExpand(kpi._id)}
                >
                {expanded[kpi._id]  ? (
                        <ChevronUp size={16} />
                        ) : (
                        <ChevronDown size={16} />
                        )}
                </button>
            </div>

            {/* KPI Table */}
            {expanded[kpi._id] && (
                <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-700 rounded-lg">
                    <thead className="bg-gray-800 text-sm bor rounded-lg">
                    <tr>
                        <th className="border border-gray-700 px-2 py-1">KPI Name</th>
                        <th className="border border-gray-700 px-2 py-1">KPI Type</th>
                        <th className="border border-gray-700 px-2 py-1">Measurement Unit</th>
                        <th className="border border-gray-700 px-2 py-1">Quarterly Goal</th>
                        <th className="border border-gray-700 px-2 py-1">GTD Goal</th>
                        <th className="border border-gray-700 px-2 py-1">GTD Achieved</th>
                        <th className="border border-gray-700 px-2 py-1">Weekly Goal</th>
                        {kpi.breakdownData.map((interval: any, i: number) => (
                        <th
                            key={i}
                            className="border border-gray-700 px-2 py-1 whitespace-nowrap"
                        >
                            Week ending {formatDate(interval.endDate)}
                        </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {kpi.childKpis.map((child: any, i: number) => {
                        const matchingBreakdown = kpi.breakdownData;
                        const matchingAchieved = matchingBreakdown.reduce(
                        (sum: number, interval: any) => sum + interval.intervalContribution,
                        0
                        );
                        return (
                        <tr key={i} className="text-center">
                            <td className="border border-gray-700 px-2 py-1">{child.kpiName}</td>
                            <td className="border border-gray-700 px-2 py-1">{kpi.divisionType}</td>
                            <td className="border border-gray-700 px-2 py-1">{kpi.measurementUnit}</td>
                            <td className="border border-gray-700 px-2 py-1">{kpi.targetValue}</td>
                            <td className="border border-gray-700 px-2 py-1">{kpi.targetValue}</td>
                            <td
                            className={`border border-gray-700 px-2 py-1 text-white ${getColor(
                                matchingAchieved,
                                kpi.targetValue
                            )}`}
                            >
                            {matchingAchieved}
                            </td>
                            <td className="border border-gray-700 px-2 py-1">20</td>
                            {matchingBreakdown.map((interval: any, j: number) => (
                            <td key={j} className="border border-gray-700 px-2 py-1">
                                <span
                                className={`text-white text-xs px-2 py-1 rounded-full ${
                                    interval.isUpdated
                                    ? "bg-yellow-400"
                                    : interval.intervalContribution === 0
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                                }`}
                                >
                                Week
                                </span>
                            </td>
                            ))}
                        </tr>
                        );
                    })}
                    </tbody>
                </table>
                </div>
            )}
            </div>
        ))}
        </div>
    </>
  );
};

export default DashboardKpiCard;
