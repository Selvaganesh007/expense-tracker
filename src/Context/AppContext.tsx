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
  const [profileDetails, setProfileDetails] = useState<ProfileDetails>({});

  useEffect(() => {
    const userDetails = localStorage.getItem("firebaseToken");
    if (userDetails) {
      // ✅ Decode directly to an object
      const decoded = jwtDecode<ProfileDetails>(userDetails);
      setProfileDetails(decoded);
      // console.log("Decoded JWT:", decoded);
    }
  }, []);

  // 🌓 Theme State
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    document.body.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  return (
    <AppContext.Provider
      value={{
        profileDetails,
        setProfileDetails,
        themeMode,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
