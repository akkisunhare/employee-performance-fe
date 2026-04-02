
import { getColorByPercentage, getTextColor } from '@/utils/KpiUtils';
import { formattedValue } from '@/utils/ReusableFunctions';
import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function RenderHeatMap({breakdownData}: {breakdownData:any}) {  
  return (
   <div className="w-full h-full p-4 flex items-center justify-center">
        <div className="w-full flex flex-col">
          <div className="flex-1 flex-col overflow-x-auto">
            <div className="flex flex-col">
              <div className="flex">
                {breakdownData.map((interval:any, index: number) => {
                  const target = interval.intervalTarget || 0;
                  const value = interval.intervalContribution;
                  const bgColor = getColorByPercentage(value, target,interval?.isUpdated);
                  const textColor = getTextColor(bgColor);
                  return (
                    <div
                      key={`${index}-${value}-${target}`}
                      className={`flex-1 min-w-[70px] h-12 border border-[#252525] flex flex-col items-center justify-center ${bgColor} ${textColor}`}
                    >
                      {/* <div>{formattedValue(value)}</div> */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>{formattedValue(value)}</div>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="max-w-[300px]">
                          <p className="text-sm">
                            {interval?.notes || "No notes available"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
              <div className="flex !flex-row text-xs text-gray-400 mt-1">
                {breakdownData.map((interval:any, index:number) => (
                  <div key={index} className="flex-1 min-w-[70px] text-center">
                    {interval.intervalName}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default React.memo(RenderHeatMap);