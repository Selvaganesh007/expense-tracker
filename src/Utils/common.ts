export const typeOptions = [
  { label: "Rent", value: "rent" },
  { label: "Food", value: "food" },
  { label: "Movie", value: "movie" },
  { label: "Outing", value: "outing" },
  { label: "Petrol", value: "petrol" },
  { label: "Debt", value: "debt" },
  { label: "Others", value: "others" },
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
