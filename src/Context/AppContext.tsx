import { jwtDecode } from "jwt-decode";
import React, { createContext, useState, useEffect } from "react";

interface AppProviderProps {
  children: React.ReactElement;
}

// ✅ Define the shape of your JWT payload
interface ProfileDetails {
  name?: string;
  email?: string;
  userId?: string;
  exp?: number;
  iat?: number;
}

export const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: AppProviderProps) => {
  const [settings, setSettings] = useState({
    currency: "₹",
    theme: "light",
  });

  const [incomeTypes, setIncomeTypes] = useState([
    "Salary",
    "Freelance",
    "Bonus",
    "Investment",
    "Interest",
    "Other",
  ]);

  const [collection, setCollection] = useState<any[]>([]);
  const [profileDetails, setProfileDetails] = useState<ProfileDetails>({});
  const [expenseTypes, setExpenseTypes] = useState([
    "Rent",
    "Bill",
    "Food",
    "Clothes",
    "Bike",
    "Fuel",
    "Shopping",
    "Savings",
  ]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("settings");
    const savedCollection = localStorage.getItem("collection");
    const savedIncomeTypes = localStorage.getItem("incomeTypes");
    const savedExpenseTypes = localStorage.getItem("expenseTypes");
    const userDetails = localStorage.getItem("firebaseToken");

    if (userDetails) {
      // ✅ Decode directly to an object
      const decoded = jwtDecode<ProfileDetails>(userDetails);
      setProfileDetails(decoded);
      console.log("Decoded JWT:", decoded);
    }

    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedCollection) setCollection(JSON.parse(savedCollection));
    if (savedIncomeTypes) setIncomeTypes(JSON.parse(savedIncomeTypes));
    if (savedExpenseTypes) setExpenseTypes(JSON.parse(savedExpenseTypes));
  }, []);

  // ✅ Save updates back to localStorage
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("incomeTypes", JSON.stringify(incomeTypes));
  }, [incomeTypes]);

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
        profileDetails,
        setProfileDetails,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
