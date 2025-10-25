import "./Navbar.scss";
import { MdOutlineDashboard, MdOutlineSettings } from "react-icons/md";
import { HiCollection } from "react-icons/hi";
import { FaHistory } from "react-icons/fa";
import { NAVBAR_TABS_CONST } from "../../Utils/NAVBAR_TABS_CONST";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { CiLogout } from "react-icons/ci";

const NAVBAR_ITEMS = [
  {
    name: NAVBAR_TABS_CONST.dashboard,
    icon: <MdOutlineDashboard />,
    route: "/dashboard",
  },
  {
    name: NAVBAR_TABS_CONST.collection,
    icon: <HiCollection />,
    route: "/collection",
  },
  // {
  //   name: NAVBAR_TABS_CONST.cash_flow,
  //   icon: <MdOutlineDashboard />,
  //   route: "/cash-flow",
  // },
  {
    name: NAVBAR_TABS_CONST.history,
    icon: <FaHistory />,
    route: "/history",
  },
  {
    name: NAVBAR_TABS_CONST.Settings,
    icon: <MdOutlineSettings />,
    route: "/settings",
  },
];

function Navbar() {
  const { profileDetails } = useContext(AppContext);
  return (
    <div className="navbar">
      <div className="app_name">Expense Tracker</div>
      <div className="navlinks">
        {NAVBAR_ITEMS.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.route}
          >
            <div className="navitem">
              <div className="tab_name">{tab.name}</div>
            </div>
          </NavLink>
        ))}
      </div>
      {/* <NavLink to={"/sign-up"}>Logout</NavLink> */}
      <div className="profile">
        <h5 className="profile_name">{profileDetails?.name}</h5>
        <img className="profile-photo" src={profileDetails?.picture} alt={"Profile picture"} />
      </div>
    </div>
  );
}

export default Navbar;
