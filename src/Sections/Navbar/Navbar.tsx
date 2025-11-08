import "./Navbar.scss";
import { MdOutlineDashboard, MdOutlineSettings } from "react-icons/md";
import { HiCollection } from "react-icons/hi";
import { FaHistory } from "react-icons/fa";
import { NAVBAR_TABS_CONST } from "../../Utils/NAVBAR_TABS_CONST";
import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { AppContext } from "../../Context/AppContext";
import { CiLogout } from "react-icons/ci";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import { Avatar } from "antd";

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
  {
    name: NAVBAR_TABS_CONST.logout,
    icon: <CiLogout />,
    route: "/log-out",
  },
];

function Navbar() {
  const { profileDetails } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="app_name">Expense Tracker</div>

      {/* Hamburger Icon */}
      <div className="menu-icon" onClick={toggleMenu}>
        {menuOpen ? <IoClose size={26} /> : <RxHamburgerMenu size={24} />}
      </div>

      {/* Navigation Links */}
      <div className={`navlinks ${menuOpen ? "active" : ""}`}>
        {/* Close button inside mobile menu */}
        <div className="close-btn" onClick={closeMenu}>
          <IoClose size={28} />
        </div>

        {NAVBAR_ITEMS.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.route}
            onClick={closeMenu}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <div className="navitem">
              <div className="tab_icon">{tab.icon}</div>
              <div className="tab_name">{tab.name}</div>
            </div>
          </NavLink>
        ))}
      </div>
      <div className="profile">
        <h5 className="profile_name">{profileDetails?.name}</h5>
        {profileDetails?.picture ? (
          <img
            className="profile-photo"
            src={profileDetails?.picture}
            alt="Profile"
          />
        ) : (
          <Avatar
            style={{
              backgroundColor: "#fde3cf",
              color: "#18120eff",
              fontWeight: "700",
            }}
          >
            {profileDetails?.name?.trim()?.[0]?.toUpperCase()}
          </Avatar>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
