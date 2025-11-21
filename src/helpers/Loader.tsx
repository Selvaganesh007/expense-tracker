import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const Loader = () => {
  return (
    <div
      style={{
        height: window.innerHeight - 200,
        display: "flex",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spin
        indicator={
          <LoadingOutlined style={{ fontSize: 48, color: "#9dffe3" }} spin />
        }
      />
    </div>
  );
};

export default Loader;
