import SideBar from "./Sections/Sidebar/SideBar";
import Navbar from "./Sections/Navbar/Navbar";
import "./Base.scss";
import { Outlet } from "react-router-dom";

function Base() {
  return (
    <div className="base">
      <Navbar />
      <div className="base-container">
        <SideBar />
        <div className="base-content">
          <Outlet /> {/* 👈 Nested route content will render here */}
        </div>
      </div>
    </div>
  );
}

export default Base;
