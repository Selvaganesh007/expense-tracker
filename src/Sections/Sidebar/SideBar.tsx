import React, { useState } from "react";
import "./SideBar.scss";
import { MdOutlineDashboard, MdOutlineSettings } from "react-icons/md";
import { GiExpense, GiProfit } from "react-icons/gi";
import { FaHistory } from "react-icons/fa";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { SIDEBAR_TABS_CONST } from "../../Constents/SidebarTabs";

// ✅ MUST HAVE THIS:
const SIDEBAR_ITEMS = [
  {
    name: SIDEBAR_TABS_CONST.dashboard,
    icon: <MdOutlineDashboard />,
  },
  {
    name: SIDEBAR_TABS_CONST.expense,
    icon: <GiExpense />,
  },
  {
    name: SIDEBAR_TABS_CONST.income,
    icon: <GiProfit />,
  },
  {
    name: SIDEBAR_TABS_CONST.history,
    icon: <FaHistory />,
  },
  {
    name: SIDEBAR_TABS_CONST.Settings,
    icon: <MdOutlineSettings />,
  },
];

interface SideBarProps {
  SetCurrentTab: React.Dispatch<React.SetStateAction<string>>;
}

function SideBar({ SetCurrentTab }: SideBarProps) {
  const [sidebarClose, setSidebarClose] = useState(true);
  const sidebarClass = sidebarClose ? "sideBar" : "sideBar_icon";

  return (
    <div className={`${sidebarClass} ${!sidebarClose ? "show" : ""}`}>
      {SIDEBAR_ITEMS.map((tab) => (
        <div
          key={tab.name}
          className="sidebar_tab"
          onClick={() => SetCurrentTab(tab?.name)}
        >
          <div className="tab_icon">{tab?.icon}</div>
          {sidebarClose && <div className="tab_name">{tab?.name}</div>}
        </div>
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
