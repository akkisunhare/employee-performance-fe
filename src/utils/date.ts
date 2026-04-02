// src/utils/date.ts



export const getStatusColornew = (status: string) => {
  switch (status) {
    case 'Not yet started':
      return 'bg-red-500';
    case 'On track':
      return 'bg-green-500';
    case 'Behind schedule':
      return 'bg-[#FFA202F2]';
    case 'Complete':
      return 'bg-blue-500';
    case 'Not applicable':
      return 'bg-[#bdbdbd] text-black';
    default:
      return 'bg-gray-500';
  }
};

export const getColorByPercentage = (value: number, target: number,isUpdated:false) => {
 
  const percentage = target > 0 ? (value / target) * 100 : 0;

  if (percentage >= 120 || (target <=0 && value >0)) return "bg-blue-600";
  if (percentage >= 100) return "bg-green-600";
  if (percentage >= 80) return "bg-yellow-500";
  if (percentage >= 0 && isUpdated) return "bg-red-600";
  return "bg-[#080808]";
};

export const getTextColor = (bgColor: string) => {
  return bgColor === "bg-yellow-500" ? "text-black" : "text-white";
};