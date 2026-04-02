
import { Frequency, Interval } from "@/types/kpi";


// Get interval labels based on frequency and quarter
export const getIntervalLabels = async (
  frequency: Frequency,
  quarter: string,
  quarterStartDate:string,
  quarterEndDate:string,
): Promise<Interval[]> => {
  const [, quarterNumStr, yearStr] = quarter.match(/q(\d)-(\d{4})/) || [
    "",
    "1",
    new Date().getFullYear().toString(),
  ];
  const quarterNum = Number.parseInt(quarterNumStr);
  const year = Number.parseInt(yearStr);
   const   quarterStart = new Date(quarterStartDate);
  const   quarterEnd = new Date(quarterEndDate);

  quarterStart.setHours(0, 0, 0, 0);
  quarterEnd.setHours(0, 0, 0, 0);

  const intervals: Interval[] = [];

  switch (frequency) {
    case "daily":
      let currentDay = new Date(quarterStart);
      while (currentDay <= quarterEnd) {
        currentDay.setHours(0, 0, 0, 0);
        intervals.push({
          label: `${currentDay.getDate()}/${currentDay.getMonth() + 1}`,
          startDate: new Date(currentDay).toISOString(),
          endDate: new Date(currentDay).toISOString(),
        });
        currentDay.setDate(currentDay.getDate() + 1);
      }
      break;

    case "weekly":
      let weekStart = new Date(quarterStart);
      let weekIndex = 1;
      while (weekStart <= quarterEnd) {
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        if (weekEnd > quarterEnd) weekEnd.setTime(quarterEnd.getTime());
        weekEnd.setHours(0, 0, 0, 0);
        intervals.push({
          label: `Week ${weekIndex}`,
          startDate: new Date(weekStart).toISOString(),
          endDate: new Date(weekEnd).toISOString(),
        });

        weekStart.setDate(weekStart.getDate() + 7);
        weekIndex++;
      }
      break;

    case "monthly":
      for (let i = 0; i < 3; i++) {
        const month = (quarterNum - 1) * 3 + i;
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        const monthName = startDate.toLocaleString("default", {
          month: "short",
        });
        intervals.push({
          label: monthName,
          startDate:new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        });
      }
      break;

    case "quarterly":
      intervals.push({
        label: `Q${quarterNum}`,
        startDate: new Date(quarterStart).toISOString(),
        endDate: new Date(quarterEnd).toISOString(),
      });
      break;
  }
  return intervals;
};

  // Get current interval index based on current date
  export const getCurrentIntervalIndex = (
    frequency: Frequency,
    quarterStartDate: string,
    quarterEndDate: string
  ): number => {
    const quarterStart = new Date(quarterStartDate);
    const quarterEnd = new Date(quarterEndDate);
    const today = new Date();
       
    quarterStart.setHours(0, 0, 0, 0);
    quarterEnd.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
  
    // Case 1: If current date is before quarter starts
    if (today < quarterStart) return 0;
  
    // Case 2: If current date is after quarter ends
    if (today > quarterEnd) return -1;
  
    switch (frequency) {
      case "daily":
        const daysSinceStart = Math.floor(
          (today.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceStart;
  
      case "weekly":
        const weeksSinceStart = Math.floor(
          (today.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24 * 7)
        );
        return weeksSinceStart;
  
      case "monthly":
        return (
          today.getMonth() -
          quarterStart.getMonth() +
          12 * (today.getFullYear() - quarterStart.getFullYear())
        );
  
      case "quarterly":
        return 0; // Only one interval for a full quarter
  
      default:
        return 0; // fallback for unknown frequency
    }
  };
  
  