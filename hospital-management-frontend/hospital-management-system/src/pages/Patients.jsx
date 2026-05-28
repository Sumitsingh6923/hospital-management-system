import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaPlus, FaTrash } from "react-icons/fa";
import { MdPersonalInjury } from "react-icons/md";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Patients() {
  const { role } = useSelector((state) => state.auth);
  const isAdmin = role === "ADMIN";
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: "", age: "", gender: "", phone: "", email: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const getErrorMessage = (error, fallback) => {
    const data = error.response?.data;
    if (data?.validationErrors) {
      return Object.values(data.validationErrors).join(" ");
    }
    if (error.response?.status === 403) {
      return "Only admins can delete patient records.";
    }

    return data?.message || fallback;
  };

  const fetchPatients = async () => {
    try {
      const res = await API.get("/api/patients");
      setPatients(res.data);
    } catch (error) {
      setMessageType("danger");
      setMessage(getErrorMessage(error, "Error loading patients."));
    }
  };

  useEffect(() => {
    let active = true;

    const loadPatients = async () => {
      try {
        const res = await API.get("/api/patients");
        if (active) {
          setPatients(res.data);
        }
      } catch (error) {
        if (active) {
          setMessageType("danger");
          setMessage(getErrorMessage(error, "Error loading patients."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPatients();

    return () => {
      active = false;
    };
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const addPatient = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!isAdmin) {
      setMessageType("warning");
      setMessage("Only admins can add patient records.");
      return;
    }

    if (!form.name.trim()) {
      setMessageType("warning");
      setMessage("Name is required.");
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/api/patients", {
        ...form,
        age: form.age ? Number(form.age) : null,
      });
      await fetchPatients();
      setForm({ name: "", age: "", gender: "", phone: "", email: "" });
      setMessageType("success");
      setMessage("Patient added successfully.");
    } catch (error) {
      setMessageType("danger");
      setMessage(getErrorMessage(error, "Error adding patient."));
    } finally {
      setSubmitting(false);
    }
  };

  const deletePatient = async (id) => {
    if (!isAdmin) {
      setMessageType("warning");
      setMessage("Only admins can delete patient records.");
      return;
    }

    try {
      setDeletingId(id);
      await API.delete(`/api/patients/${id}`);
      await fetchPatients();
      setMessageType("success");
      setMessage("Patient deleted successfully.");
    } catch (error) {
      setMessageType("danger");
      setMessage(getErrorMessage(error, "Error deleting patient."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        <div className="page-title">
          <h1 className="h2 fw-bold d-flex align-items-center gap-2">
            <MdPersonalInjury className="text-success" /> Patient Management
          </h1>
          <p className="text-muted mb-0">
            {isAdmin ? "Admins can create and remove patient records here." : "Doctors can view patient records here."}
          </p>
        </div>

        {message && <div className={`alert alert-${messageType} py-2`}>{message}</div>}

        {isAdmin && (
          <form className="panel row g-3 mb-4" onSubmit={addPatient}>
            <div className="col-md-4">
              <label className="form-label">Name</label>
              <input className="form-control" value={form.name} onChange={(e) => updateForm("name", e.target.value)} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Age</label>
              <input className="form-control" type="number" min="1" max="120" placeholder="Enter your age" value={form.age} onChange={(e) => updateForm("age", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Gender</label>
              <input className="form-control" value={form.gender} onChange={(e) => updateForm("gender", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} />
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <button className="btn btn-success d-inline-flex align-items-center gap-2" type="submit" disabled={submitting}>
                <FaPlus /> {submitting ? "Adding..." : "Add Patient"}
              </button>
            </div>
          </form>
        )}

        <div className="panel table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Email</th>
                {isAdmin && <th className="text-end">Action</th>}
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
                  {isAdmin && (
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deletePatient(patient.id)}
                        disabled={deletingId === patient.id}
                        title="Delete patient"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {loading && (
                <tr>
                  <td className="text-muted" colSpan={isAdmin ? 6 : 5}>Loading patients...</td>
                </tr>
              )}
              {!loading && patients.length === 0 && (
                <tr>
                  <td className="text-muted" colSpan={isAdmin ? 6 : 5}>No patients found.</td>
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

export default Patients;
