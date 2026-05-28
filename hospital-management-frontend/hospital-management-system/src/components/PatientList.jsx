import { useEffect, useState } from "react";
import { MdPersonalInjury } from "react-icons/md";
import API from "../services/api";

function PatientList() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    API.get("/api/patients")
      .then((res) => setPatients(res.data))
      .catch(() => setPatients([]));
  }, []);

  return (
    <div className="panel h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="h5 mb-0 d-flex align-items-center gap-2">
          <MdPersonalInjury className="text-success" /> Patients
        </h2>
        <span className="badge text-bg-success">{patients.length}</span>
      </div>

      <div className="list-group list-group-flush">
        {patients.map((p) => (
          <div className="list-group-item px-0" key={p.id}>
            <div className="fw-semibold">{p.name}</div>
            <div className="small text-muted">
              {p.age ? `${p.age} years old` : ""}
            </div>
          </div>
        ))}
        {patients.length === 0 && <p className="text-muted mb-0">No patients found.</p>}
      </div>
    </div>
  );
}

export default PatientList;
