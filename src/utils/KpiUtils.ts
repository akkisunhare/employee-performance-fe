export const getColorByPercentage = (value: number, target: number,isUpdated:false) => { 
  const percentage = target > 0 ? (value / target) * 100 : 0;
  if (percentage >= 120) return "bg-blue-600";
  if (percentage >= 100) return "bg-green-600";
  if (percentage >= 80) return "bg-yellow-500";
  if (percentage >= 0 && isUpdated) return "bg-red-600";
  return "bg-[#080808]";
};

export const getTextColor = (bgColor: string) => {
  return bgColor === "bg-yellow-500" ? "text-black" : "text-white";
};
