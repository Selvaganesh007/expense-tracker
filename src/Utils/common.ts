export const expenseTypeOptions = [
  { label: "Food", value: "food" },
  { label: "Rent", value: "rent" },
  { label: "Bills", value: "bills" },
];

export const incomeTypeOptions = [
  { label: "Salary", value: "salary" },
  { label: "Freelance", value: "freelance" },
  { label: "Investment", value: "investment" },
];

export const settings: { expense: string[]; income: string[] } = {
  expense: ["Salary", "Freelance", "Bonus", "Investment", "Interest", "Other"],
  income: [
    "Rent",
    "Bill",
    "Food",
    "Clothes",
    "Bike",
    "Fuel",
    "Shopping",
    "Savings",
  ],
};
