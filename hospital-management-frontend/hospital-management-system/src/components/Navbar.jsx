import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaSignOutAlt, FaUserMd, FaUsersCog } from "react-icons/fa";
import { MdDashboard, MdPersonalInjury } from "react-icons/md";
import { logout as logoutUser } from "../store/authSlice";
import AppLogo from "./AppLogo";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.role);

  const logout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg app-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand app-brand d-flex align-items-center gap-2 fw-bold" to="/dashboard">
          <AppLogo size="sm" showText />
        </Link>

        <div className="nav-actions d-flex flex-wrap align-items-center gap-2 ms-auto">
          <Link className="btn btn-sm btn-light d-inline-flex align-items-center gap-2" to="/dashboard">
            <MdDashboard /> Dashboard
          </Link>
          <Link className="btn btn-sm btn-light d-inline-flex align-items-center gap-2" to="/doctors">
            <FaUserMd /> Doctors
          </Link>
          {role === "DOCTOR" && (
            <Link className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2" to="/doctor-panel">
              <FaUserMd /> Doctor Panel
            </Link>
          )}
          {role !== "PATIENT" && (
            <Link className="btn btn-sm btn-light d-inline-flex align-items-center gap-2" to="/patients">
              <MdPersonalInjury /> Patients
            </Link>
          )}
          {role === "ADMIN" && (
            <Link className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2" to="/admin">
              <FaUsersCog /> Admin
            </Link>
          )}
          <button className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-2" onClick={logout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
