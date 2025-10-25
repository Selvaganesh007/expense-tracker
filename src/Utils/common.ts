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

export const transactionModeOptions = [
  { label: "Cash", value: "cash" },
  { label: "Google pay", value: "google_pay" },
  { label: "Debit card", value: "debit_card" },
  { label: "credit card", value: "credit_card" },
  { label: "Bank account", value: "bank_account" },
];

export const settings: { currency: string[]; theme: string[]; expense: {}; income: {}; transactionMode: {} } = {
  currency: ['₹','€','£','¥','$'],
  theme: ['dark', 'light'],
  income: [
    { label: "Salary", value: "salary" },
    { label: "Freelance", value: "freelance" },
    { label: "Bonus", value: "bonus" },
    { label: "Investment", value: "investment" },
    { label: "Interest", value: "interest" },
    { label: "Others", value: "others" },
  ],
  expense: [
    { label: "Rent", value: "rent" },
    { label: "Bill", value: "bill" },
    { label: "Food", value: "food" },
    { label: "Dress", value: "dress" },
    { label: "Fuel", value: "fuel" },
    { label: "Shopping", value: "shopping" },
    { label: "Savings", value: "savings" },
    { label: "Others", value: "others" },
  ],
  transactionMode: [
    { label: "Cash", value: "cash" },
    { label: "Google pay", value: "google_pay" },
    { label: "Debit card", value: "debit_card" },
    { label: "credit card", value: "credit_card" },
    { label: "Bank account", value: "bank_account" },
  ],
};
