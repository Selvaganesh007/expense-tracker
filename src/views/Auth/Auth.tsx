import React from "react";
import { AuthContainer } from "./index.styles";
import { Flex, Typography } from "antd";
import SignInContainer from "../../containers/SignInContainer";

function Auth() {
  return (
    <AuthContainer>
      <Flex vertical>
        <Typography.Title>Expense Tracker</Typography.Title>
        <Flex
          style={{ display: "flex", flexDirection: "column" }}
          align="center"
          justify="center"
        >
          <SignInContainer />
        </Flex>
      </Flex>
    </AuthContainer>
  );
}

export default Auth;
