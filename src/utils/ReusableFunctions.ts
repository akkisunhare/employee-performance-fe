export const formattedValue = (value: number): number => {
  return value % 1 === 0 ? value : Number(value.toFixed(2));
};

export const dateFormate = (value: string | Date): string => {
  const date = new Date(value);

  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
};
