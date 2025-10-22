import React, { useState } from "react";
import "./SideBar.scss";
import { MdOutlineDashboard, MdOutlineSettings } from "react-icons/md";
import { HiCollection } from "react-icons/hi";
import { FaHistory } from "react-icons/fa";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { SIDEBAR_TABS_CONST } from "../../Constents/SIDEBAR_TABS_CONST";
import { NavLink } from "react-router-dom";

const SIDEBAR_ITEMS = [
  {
    name: SIDEBAR_TABS_CONST.dashboard,
    icon: <MdOutlineDashboard />,
    route: "/home/dashboard",
  },
  {
    name: SIDEBAR_TABS_CONST.collection,
    icon: <HiCollection />,
    route: "/home/collection",
  },
  {
    name: SIDEBAR_TABS_CONST.history,
    icon: <FaHistory />,
    route: "/home/history",
  },
  {
    name: SIDEBAR_TABS_CONST.Settings,
    icon: <MdOutlineSettings />,
    route: "/home/settings",
  },
];

function SideBar() {
  const [sidebarClose, setSidebarClose] = useState(true);
  const sidebarClass = sidebarClose ? "sideBar" : "sideBar_icon";

  return (
    <div className={`${sidebarClass} ${!sidebarClose ? "show" : ""}`}>
      {SIDEBAR_ITEMS.map((tab) => (
        <NavLink
          key={tab.name}
          to={tab.route}
          className={({ isActive }) =>
            `sidebar_tab ${isActive ? "active" : ""}`
          }
        >
          <div className="tab_icon">{tab.icon}</div>
          {sidebarClose && <div className="tab_name">{tab.name}</div>}
        </NavLink>
      ))}

      <div
        className="sidebar_close-icon"
        onClick={() => setSidebarClose(!sidebarClose)}
      >
        {sidebarClose ? <FaAnglesLeft /> : <FaAnglesRight />}
      </div>
    </div>
  );
}

export default SideBar;
