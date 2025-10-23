import styled from "styled-components";
import { Button, Card } from "antd";

export const AuthContainer = styled.div`
  padding: 0 20px;
`;

export const FormElementContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
`;

export const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
`;

export const AuthCard = styled(Card)`
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;

  .ant-card-head-title {
    font-weight: 600;
    font-size: 1.2rem;
  }
`;

export const SwitchText = styled.div`
  text-align: center;
  margin-top: 8px;
  color: #555;

  button {
    padding: 0;
    color: #1677ff;
    font-weight: 500;
  }
`;

export const GoogleButton = styled(Button)`
  background-color: #fff;
  border: 1px solid #ddd;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    border-color: #1677ff;
  }

  img {
    width: 18px;
    height: 18px;
  }
`;
