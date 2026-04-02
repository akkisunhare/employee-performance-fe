import React from "react";

interface MeterChartProps {
  newData?: any;
}
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
      return sum
      // return sum / item.targetValue * 100
    }
    const divisor = validWeeks.length;
    if (divisor === 0) return 0;
    const average = sum / divisor;
    return Math.round(average);
  };
const MeterChart: React.FC<MeterChartProps> = ({ newData }: MeterChartProps) => {
const TargetValue = Number(newData?.targetValue);
// const CurrentValue =Number (newData?.qtdAchieved);
const CurrentValue = calculateSum(newData);

  // Calculate percentage safely
  let percentage = TargetValue > 0 ? (CurrentValue / TargetValue) * 100 : 0;

  // Ensure percentage is valid (handle NaN cases)
  if (isNaN(percentage)) {
    percentage = 0;
  }

  // const boundedValue = newData.divisionType == 'standalone' ? Math.min(100, Math.max(0, percentage)) / 13 : Math.min(100, Math.max(0, percentage));
  // const boundedValue = Math.min(100, Math.max(0, percentage));   // Old percentage max 100%
  // const boundedValue = Math.min(percentage, Math.max(0, percentage));      // New Actual percentage 100%++
  const boundedValue = Math.min(121, Math.max(0, percentage));      // New Actual percentage 100%++
  // const rotationDegree = (boundedValue / 100) * 180 - 90;     // Old percentage max 100%
  const rotationDegree = (boundedValue / 120) * 180 - 90;   // New Actual percentage 120%
  const getBackgroundGradient = (value: number) => {
    const rounded = Math.round(value);
    return rounded > 120
      // ? "linear-gradient(115.62deg, #FF3D3D 25%, #FFA800 45%, #3ADF3A 65%, #007BFF 85%)"
      // : "linear-gradient(115.62deg, #FF3D3D 25%, #FFA800 45%, #3ADF3A 65%, #0068FF 85%)";
      ? "linear-gradient(115.62deg, red 64%, yellow  80%, green  96%, blue  100%)"
      : "linear-gradient(115.62deg, red 64%, yellow 80%, green 96%, blue 100%)";
  };
  

  return (
    <div className="rounded-xl cursor-default flex flex-col items-center justify-center p-0.5">
      <div
        style={{
          backgroundImage: getBackgroundGradient(boundedValue),
        }}
        className="relative w-[100px] h-[50px] rounded-t-full overflow-hidden flex justify-center items-end"
      >
        <div className="relative w-[90px] h-[45px] bg-[#111111] mt-3 rounded-t-full overflow-hidden flex justify-center items-end">
          <div
            style={{
              bottom: "1px",
              position: "absolute",
              width: "35px",
              height: "37px",
              background: "#F6AB7B",
              transformOrigin: "bottom center",
              clipPath: "polygon(50% 0%, 6% 100%, 92% 100%)",
              transform: `rotate(${rotationDegree}deg)`,
              transition: "transform 0.3s ease-out",
            }}
          ></div>
          <div
            className="bg-[#111111] rounded-full h-[56px] flex items-center justify-center w-[50px] pb-[1.5rem] text-[10px] font-[400]"
            style={{
              position: "absolute",
              bottom: "-30px",
              color: "white",
              boxShadow: "0 0 8px 3px rgba(128, 128, 128, 0.5)",
            }}
          >
            {/* {boundedValue.toFixed(1)}% */}
            {percentage?.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export { MeterChart };
