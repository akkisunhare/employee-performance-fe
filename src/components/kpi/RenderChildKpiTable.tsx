import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Avatar, AvatarFallback } from '../ui/avatar';

function RenderChildKpiTable({childKpis, isCompany= false}:{childKpis:any[],isCompany?:boolean}) {
    if (!childKpis?.length) {
        return (
          <div className="w-full bg-black text-white rounded-2xl p-6 text-center border border-[#252525]">
            No linked {isCompany ? "team" : "individual"} KPIs found.
          </div>
        );
      }
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };
  
      return (
        <div className="w-full bg-black text-white rounded-2xl transition-all duration-300 ease-in-out overflow-auto max-h-[300px]">
          <Table className="text-white">
            <TableHeader>
              <TableRow className={isCompany ? "border border-[#252525]" : "border-b border-[#252525]"}>
                <TableHead className="border border-[#252525] text-white px-0 py-4 text-center font-medium">
                  S.NO
                </TableHead>
                <TableHead className="border border-[#252525] text-white px-4 py-4 text-left font-medium">
                  {isCompany ? "Linked Team KPI" : "Linked Individual KPI"}
                </TableHead>
                <TableHead className="border border-[#252525] text-white px-4 py-4 text-center font-medium">
                  Select Owner
                </TableHead>
                <TableHead className="border border-[#252525] text-white px-4 py-4 text-center font-medium">
                  Contribution
                </TableHead>
                <TableHead className="border border-[#252525] text-white px-4 py-4 text-center font-medium">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {childKpis.map((childKpi, index) => {
                // const { totalContribution, totalTarget } = childKpi.breakdownData.reduce(
                //   (acc: any, interval: any) => {
                //     acc.totalContribution += Number(interval.intervalContribution);
                //     acc.totalTarget += Number(interval.intervalTarget);
                //     return acc;
                //   },
                //   { totalContribution: 0, totalTarget: 0 }
                // );
                   const achieved = Number(childKpi.qtdAchieved);
                      const target = Number(childKpi.targetValue);
  
                const widthPct = target > 0 && !isNaN(achieved)
                  ? Math.min(100, (achieved / target) * 100)
                  : 0;
  
                  let ownerName = "";
                  if (isCompany) {
                    // For company KPIs showing team KPIs, owner is the team
                    ownerName = childKpi.teamId?.name || childKpi.teamName || "Team";
                  } else {
                    // For team KPIs showing individual KPIs, owner is the individual
                    ownerName = childKpi.ownerId?.name || "Individual";
                  }
                return (
                  <TableRow
                    key={childKpi._id}
                    className={isCompany ? "border-b border-[#252525] hover:bg-transparent" : "border border-[#252525] hover:bg-transparent"}
                  >
                    <TableCell className="border border-[#252525] px-4 py-4 text-center">
                      {index + 1}
                    </TableCell>
                    <TableCell className="border border-[#252525] px-4 py-4 text-left">
                      {childKpi.name}
                    </TableCell>
                    <TableCell className="border border-[#252525] px-4 py-4">
                      <div className="flex justify-center">
                        <TooltipProvider>
                          < Tooltip>
                            <TooltipTrigger asChild>
                              <Avatar className="h-8 w-8 text-black">
                                <AvatarFallback>
                                  {getInitials(ownerName)}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{ownerName}</p>
                            </TooltipContent>
                          </ Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell className="border border-[#252525] px-4 py-4 text-center">
                      {Number(childKpi.contribution).toFixed(2)}%
                    </TableCell>
                    <TableCell className="border border-[#252525] px-4 py-4">
                      <div className="flex justify-center">
                        <TooltipProvider>
                          < Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`h-2 w-16 ${isCompany ? "bg-gray-800" : "bg-[#252525]"} rounded-full overflow-hidden`}>
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: `${widthPct}%` }}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{widthPct.toFixed(1)}%</p>
                            </TooltipContent>
                          </ Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      );
}

export default React.memo(RenderChildKpiTable)
