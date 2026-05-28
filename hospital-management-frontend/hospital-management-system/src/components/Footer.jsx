import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import AppLogo from "./AppLogo";

function Footer() {
  return (
    <footer className="app-footer mt-auto">
      <div className="container py-4">
        <div className="row gy-3 align-items-center">
          <div className="col-md-5">
            <div className="d-flex align-items-center gap-2 fw-semibold text-dark">
              <AppLogo size="sm" />
              Hospital Management System
            </div>
            <p className="small text-muted mb-0 mt-1">
              Real-time hospital operations, patient records, doctor schedules, and appointment management.
            </p>
          </div>

          <div className="col-md-7">
            <div className="d-flex flex-wrap justify-content-md-end gap-3 small text-muted">
              <span>
                &copy; {new Date().getFullYear()} Hospital Management System
              </span>
              <span className="d-inline-flex align-items-center gap-2">
                <FaPhoneAlt /> +91 98765 43210
              </span>
              <span className="d-inline-flex align-items-center gap-2">
                <MdEmail /> support@hospital.local
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
