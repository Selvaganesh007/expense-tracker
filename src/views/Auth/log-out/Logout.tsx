import React, { useEffect } from "react";
import { Result, Spin } from "antd";
import { handleClearLocalStorage } from "../../../Utils/localStorageFns";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    handleClearLocalStorage();
    const timer = setTimeout(() => {
      navigate("/sign-in");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Result
        status="success"
        title={
          <span style={{ color: "white" }}>
            You have been logged out successfully
          </span>
        }
        subTitle={
          <span style={{ color: "white" }}>
            Redirecting you to the sign-in page...
          </span>
        }
      />
      <Spin size="large" style={{ marginTop: 20 }} />
    </div>
  );
}

export default Logout;
