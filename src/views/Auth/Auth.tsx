import React, { useContext, useEffect } from "react";
import { AuthContainer } from "./index.styles";
import { Flex, Typography } from "antd";
import SignInContainer from "../../containers/SignInContainer";
import { jwtDecode } from "jwt-decode";
import { AppContext } from "../../Context/AppContext";

interface ProfileDetails {
  name?: string;
  email?: string;
  userId?: string;
  exp?: number;
  iat?: number;
}

function Auth() {
  const { setProfileDetails } = useContext(AppContext);

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
    <AuthContainer>
      <Flex
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
        align="center"
        justify="center"
      >
        <SignInContainer />
      </Flex>
    </AuthContainer>
  );
}

export default Auth;
