import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            <Button onClick={() => navigate(-1)}>Go Back</Button>
            <Button type="primary" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </div>
        }
      />
    </div>
  );
}
