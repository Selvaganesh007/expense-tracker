import React, { useState } from "react";
import { Button, Form, Input, message, Divider } from "antd";
import {
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { AuthCard, PageContainer, SwitchText } from "../index.styles";
import { auth } from "../../../../firebase";

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, values.email);

      if (methods.includes("google.com")) {
        messageApi.warning(
          "This account uses Google Sign-In. Please sign in with Google instead."
        );
      } else if (methods.includes("password")) {
        await sendPasswordResetEmail(auth, values.email);
        messageApi.success(
          "Password reset link sent! Please check your email."
        );
      } else {
        messageApi.error("No account found with this email address.");
      }
    } catch (error: any) {
      console.error("Error:", error);
      messageApi.error(error.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer style={{ height: "100vh", backgroundColor: "transparent" }}>
      {contextHolder}
      <AuthCard title="Forgot Password">
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            label="Registered Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="Enter your registered email" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>OR</Divider>

        <SwitchText>
          Remember your password?{" "}
          <Button type="link" onClick={() => navigate("/sign-in")}>
            Back to Sign In
          </Button>
        </SwitchText>
      </AuthCard>
    </PageContainer>
  );
};

export default ForgotPassword;
