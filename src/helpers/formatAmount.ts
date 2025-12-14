// utils/formatAmount.ts
export const formatAmount = (amount: number | string) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return "0";
  return Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
