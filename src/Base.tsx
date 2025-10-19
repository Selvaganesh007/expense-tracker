import React, { useEffect, useState } from "react";
import SideBar from "./Sections/Sidebar/SideBar";
import Navbar from "./Sections/Navbar/Navbar";
import "./Base.scss";
import Dashboard from "./Sections/Dashboard/Dashboard";
import History from "./Sections/History/History";
import Settings from "./Sections/SettingsModule/Settings";
import { SIDEBAR_TABS_CONST } from "./Constents/SIDEBAR_TABS_CONST";
import Collection from "./Sections/Collection/Collection";

function Base() {
  const [currentTab, SetCurrentTab] = useState<string>("Dashboard");

  useEffect(() => {
    renderSections();
  }, [currentTab]);

  const renderSections = () => {
    switch (currentTab) {
      case SIDEBAR_TABS_CONST.dashboard:
        return <Dashboard />;
      case SIDEBAR_TABS_CONST.collection:
        return <Collection />;
      case SIDEBAR_TABS_CONST.history:
        return <History />;
      case SIDEBAR_TABS_CONST.Settings:
        return <Settings />;
      default:
        <Dashboard />;
        break;
    }
  };

  return (
    <div className="base">
      <Navbar />
      <SideBar SetCurrentTab={SetCurrentTab} />
      <div>
        <div className="section_tab">{renderSections()}</div>
      </div>
    </div>
  );
}

export default Base;
