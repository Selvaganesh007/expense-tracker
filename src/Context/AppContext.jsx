import React, { createContext, useState, useEffect } from "react";

// ✅ Create context
export const AppContext = createContext();

// ✅ Provider component
export const AppProvider = ({ children }) => {
  // Global states
  const [settings, setSettings] = useState({
    currency: "₹",
    theme: "light",
  });

  const [income, setIncome] = useState([]);
  const [incomeTypes, setIncomeTypes] = useState([
    "Salary", "Freelance", "Bonus", "Investment", "Other"
  ]);

  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([
    "Rent", "Bill", "Food", "Shopping", "Savings"
  ]);

  // ✅ Load all data from localStorage once
  useEffect(() => {
    const savedSettings = localStorage.getItem("settings");
    const savedIncome = localStorage.getItem("income");
    const savedIncomeTypes = localStorage.getItem("incomeTypes");
    const savedExpenses = localStorage.getItem("expenses");
    const savedExpenseTypes = localStorage.getItem("expenseTypes");

    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedIncome) setIncome(JSON.parse(savedIncome));
    if (savedIncomeTypes) setIncomeTypes(JSON.parse(savedIncomeTypes));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedExpenseTypes) setExpenseTypes(JSON.parse(savedExpenseTypes));
  }, []);

  // ✅ Always sync to localStorage
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("income", JSON.stringify(income));
  }, [income]);

  useEffect(() => {
    localStorage.setItem("incomeTypes", JSON.stringify(incomeTypes));
  }, [incomeTypes]);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("expenseTypes", JSON.stringify(expenseTypes));
  }, [expenseTypes]);

  return (
    <AppContext.Provider
      value={{
        settings, setSettings,
        income, setIncome,
        incomeTypes, setIncomeTypes,
        expenses, setExpenses,
        expenseTypes, setExpenseTypes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
