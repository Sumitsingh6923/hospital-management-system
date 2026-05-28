import { useEffect, useState } from "react";
import { FaUserMd } from "react-icons/fa";
import API from "../services/api";

function DoctorList() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    API.get("/api/doctors")
      .then((res) => setDoctors(res.data))
      .catch(() => setDoctors([]));
  }, []);

  return (
    <div className="panel h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="h5 mb-0 d-flex align-items-center gap-2">
          <FaUserMd className="text-primary" /> Doctors
        </h2>
        <span className="badge text-bg-primary">{doctors.length}</span>
      </div>

      <div className="list-group list-group-flush">
        {doctors.map((d) => (
          <div className="list-group-item px-0" key={d.id}>
            <div className="fw-semibold">{d.name}</div>
            <div className="small text-muted">{d.specialization}</div>
          </div>
        ))}
        {doctors.length === 0 && <p className="text-muted mb-0">No doctors found.</p>}
      </div>
    </div>
  );
}

export default DoctorList;
