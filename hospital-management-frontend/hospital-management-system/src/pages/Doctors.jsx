import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaEdit, FaPlus, FaSave, FaTimes, FaTrash, FaUserMd } from "react-icons/fa";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { specializationOptions } from "../constants/specializations";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const role = useSelector((state) => state.auth.role);
  const canManage = role === "ADMIN";

  const getErrorMessage = (error, fallback) => {
    const data = error.response?.data;
    if (data?.validationErrors) {
      return Object.values(data.validationErrors).join(" ");
    }

    return data?.message || fallback;
  };

  const fetchDoctors = async () => {
    try {
      const res = await API.get("/api/doctors");
      setDoctors(res.data);
    } catch (error) {
      setMessageType("danger");
      setMessage(getErrorMessage(error, "Error loading doctors."));
    }
  };

  useEffect(() => {
    API.get("/api/doctors")
      .then((res) => setDoctors(res.data))
      .catch((error) => {
        setMessageType("danger");
        setMessage(getErrorMessage(error, "Error loading doctors."));
      });
  }, []);

  const resetForm = () => {
    setName("");
    setSpecialization("");
    setEmail("");
    setEditingId(null);
  };

  const startEdit = (doctor) => {
    setEditingId(doctor.id);
    setName(doctor.name);
    setSpecialization(doctor.specialization);
    setEmail(doctor.email);
    setMessage("");
  };

  const saveDoctor = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      setSubmitting(true);
      const payload = { name, specialization, email };
      if (editingId) {
        await API.put(`/api/doctors/${editingId}`, payload);
      } else {
        await API.post("/api/doctors", payload);
      }
      await fetchDoctors();
      resetForm();
      setMessageType("success");
      setMessage(editingId ? "Doctor updated successfully." : "Doctor added successfully.");
    } catch (error) {
      setMessageType("danger");
      setMessage(getErrorMessage(error, editingId ? "Error updating doctor." : "Only admins can add doctors."));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteDoctor = async (id) => {
    try {
      await API.delete(`/api/doctors/${id}`);
      await fetchDoctors();
      if (editingId === id) {
        resetForm();
      }
      setMessageType("success");
      setMessage("Doctor deleted successfully.");
    } catch (error) {
      setMessageType("danger");
      setMessage(getErrorMessage(error, "Only admins can delete doctors."));
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        <div className="page-title">
          <h1 className="h2 fw-bold d-flex align-items-center gap-2">
            <FaUserMd className="text-primary" /> Doctors Management
          </h1>
          <p className="text-muted mb-0">View doctor profiles and manage staff from the admin role.</p>
        </div>

        {message && <div className={`alert alert-${messageType} py-2`}>{message}</div>}

        {canManage && (
          <form className="panel row g-3 mb-4" onSubmit={saveDoctor}>
            <div className="col-md-4">
              <label className="form-label">Name</label>
              <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Specialization</label>
              <select
                className="form-select"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                required
              >
                <option value="">Select Specialization</option>
                {specialization
                  && !specializationOptions.includes(specialization)
                  && <option value={specialization}>{specialization}</option>}
                {specializationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="col-12">
              <button className="btn btn-primary d-inline-flex align-items-center gap-2 me-2" type="submit" disabled={submitting}>
                {editingId ? <FaSave /> : <FaPlus />} {submitting ? "Saving..." : editingId ? "Update Doctor" : "Add Doctor"}
              </button>
              {editingId && (
                <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" type="button" onClick={resetForm}>
                  <FaTimes /> Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="panel table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Email</th>
                {canManage && <th className="text-end">Action</th>}
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.id}>
                  <td className="fw-semibold">{doc.name}</td>
                  <td>{doc.specialization}</td>
                  <td>{doc.email}</td>
                  {canManage && (
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => startEdit(doc)} title="Edit doctor">
                        <FaEdit />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteDoctor(doc.id)} title="Delete doctor">
                        <FaTrash />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Doctors;
