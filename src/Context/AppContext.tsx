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

  return (
    <AppContext.Provider
      value={{
        profileDetails,
        setProfileDetails,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
