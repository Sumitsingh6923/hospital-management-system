import { useEffect, useState } from "react";
import { FaUserMd } from "react-icons/fa";
import { MdPersonalInjury } from "react-icons/md";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function DoctorPanel() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get("/api/doctors/me/patients")
      .then((res) => setPatients(res.data))
      .catch((error) => setMessage(error.response?.data?.message || "Unable to load your patients."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        <div className="page-title">
          <h1 className="h2 fw-bold d-flex align-items-center gap-2">
            <FaUserMd className="text-primary" /> Doctor Panel
          </h1>
          <p className="text-muted mb-0">Patients shown here are linked to your booked appointments.</p>
        </div>

        {message && <div className="alert alert-info py-2">{message}</div>}

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="stat-card">
              <MdPersonalInjury className="stat-icon text-success" />
              <div>
                <p className="text-muted small mb-1">My patients</p>
                <h2 className="h4 mb-0">{loading ? "..." : patients.length}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="panel table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td className="fw-semibold">{patient.name}</td>
                  <td>{patient.age || ""}</td>
                  <td>{patient.gender || "-"}</td>
                  <td>{patient.phone || "-"}</td>
                  <td>{patient.email || "-"}</td>
                </tr>
              ))}
              {!loading && patients.length === 0 && (
                <tr>
                  <td className="text-muted" colSpan="5">No patients assigned yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default DoctorPanel;
