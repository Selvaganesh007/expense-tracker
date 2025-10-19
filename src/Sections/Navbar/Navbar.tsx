import "./Navbar.scss";
import { CgProfile } from "react-icons/cg";

function Navbar() {
  return (
    <div className="navbar">
      <div className="app_name">Expense Tracker</div>
      <div className="profile_icon">
        <CgProfile size={25} color={"white"} />
      </div>
    </div>
  );
}

export default Navbar;
