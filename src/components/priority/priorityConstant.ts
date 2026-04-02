import { WeekInterval } from "@/types/priority";

export function formatDateRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);

  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const startStr = start.toLocaleDateString(undefined, options);
  const endStr = end.toLocaleDateString(undefined, options);

  return `${startStr} - ${endStr}`;
}
export const formatDateRange1 = (startWeek: WeekInterval, endWeek: WeekInterval): string => {
  const format = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    }).replace(/ /g, '-');
  };

  return `${format(startWeek.startDate)} To ${format(endWeek.endDate)}`;
};