import React, { createContext, useState, useEffect } from "react";

interface AppProviderProps {
  children: React.ReactElement;
}

export const AppContext = createContext<any>(null);
export const AppProvider = ({ children }: AppProviderProps) => {
  // Global states
  const [settings, setSettings] = useState({
    currency: "₹",
    theme: "light",
  });
  const [incomeTypes, setIncomeTypes] = useState([
    "Salary",
    "Freelance",
    "Bonus",
    "Investment",
    "Intrest",
    "Other",
  ]);

  const [collection, setCollection] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([
    "Rent",
    "Bill",
    "Food",
    "Cloths",
    "Bike",
    "Fuel",
    "Shopping",
    "Savings",
  ]);

  // ✅ Load all data from firebase once
  useEffect(() => {
    const savedSettings = localStorage.getItem("settings");
    const savedCollection = localStorage.getItem("collection");
    const savedIncomeTypes = localStorage.getItem("incomeTypes");
    const savedExpenseTypes = localStorage.getItem("expenseTypes");

    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedCollection) setCollection(JSON.parse(savedCollection));
    if (savedIncomeTypes) setIncomeTypes(JSON.parse(savedIncomeTypes));
    if (savedExpenseTypes) setExpenseTypes(JSON.parse(savedExpenseTypes));
  }, []);

  // ✅ Always sync to firebase
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("incomeTypes", JSON.stringify(incomeTypes));
  }, [incomeTypes]);

  useEffect(() => {
    localStorage.setItem("collection", JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    localStorage.setItem("expenseTypes", JSON.stringify(expenseTypes));
  }, [expenseTypes]);

  return (
    <AppContext.Provider
      value={{
        settings,
        setSettings,
        incomeTypes,
        setIncomeTypes,
        collection,
        setCollection,
        expenseTypes,
        setExpenseTypes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
