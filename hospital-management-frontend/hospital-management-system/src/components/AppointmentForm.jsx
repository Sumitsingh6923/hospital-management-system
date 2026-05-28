import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaCalendarCheck } from "react-icons/fa";
import API from "../services/api";

const getApiErrorMessage = (error, fallback) => {
  const data = error.response?.data;

  if (data?.validationErrors) {
    return Object.values(data.validationErrors).join(" ");
  }

  return data?.message || fallback;
};

function AppointmentForm({ onAppointmentChange }) {
  const { role, email, fullName } = useSelector((state) => state.auth);
  const canManageStatus = role === "ADMIN" || role === "DOCTOR";
  const canSelectPatient = role !== "PATIENT";
  const today = new Date().toISOString().slice(0, 10);
  const defaultPatientName = fullName || email || "Current patient";
  const [currentPatientName, setCurrentPatientName] =
    useState(defaultPatientName);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const loadAppointments = async () => {
    const res = await API.get("/api/appointments");
    setAppointments(res.data);
    return res;
  };

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      setMessage("");

      try {
        const [doctorRes, patientRes] = await Promise.all([
          API.get("/api/doctors"),
          canSelectPatient
            ? API.get("/api/patients")
            : API.get("/api/patients/me"),
        ]);
        const appointmentRes = await loadAppointments();

        setDoctors(doctorRes.data);
        if (canSelectPatient) {
          setPatients(patientRes.data);
        } else {
          setPatientId(String(patientRes.data.id));
          setCurrentPatientName(patientRes.data.name || defaultPatientName);
          setPatients([patientRes.data]);
        }
        setAppointments(appointmentRes.data);
      } catch {
        setMessageType("danger");
        setMessage(
          "Unable to load appointment options. Please check your login role and backend server.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [canSelectPatient, defaultPatientName]);

  const bookAppointment = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!doctorId || !patientId || !date || !time) {
      setMessageType("warning");
      setMessage("Please fill all fields.");
      return;
    }

    if (date < today) {
      setMessageType("warning");
      setMessage("Appointment date cannot be in the past.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        doctorId: Number(doctorId),
        date,
        appointmentTime: time,
        emergency,
        symptoms,
      };

      if (patientId) {
        payload.patientId = Number(patientId);
      }

      await API.post("/api/appointments", payload);

      setDoctorId("");
      if (canSelectPatient) {
        setPatientId("");
      }
      setDate("");
      setTime("");
      setEmergency(false);
      setSymptoms("");
      await loadAppointments();
      onAppointmentChange?.();
      setMessageType("success");
      setMessage("Appointment booked successfully.");
    } catch (error) {
      setMessageType("danger");
      setMessage(getApiErrorMessage(error, "Unable to book appointment."));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDateAppointments = appointments.filter(
    (appointment) => appointment.date === date,
  );
  const selectedPatient = patients.find(
    (patient) => String(patient.id) === String(patientId),
  );
  const visibleAppointments = appointments
    .sort((a, b) => `${a.date} ${a.appointmentTime || ""}`.localeCompare(`${b.date} ${b.appointmentTime || ""}`))
    .slice(0, 6);
  const statusStyles = {
    BOOKED: "text-bg-success",
    COMPLETED: "text-bg-primary",
    CANCELLED: "text-bg-secondary",
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      setUpdatingStatusId(appointmentId);
      await API.patch(`/api/appointments/${appointmentId}/status`, { status });
      await loadAppointments();
      onAppointmentChange?.();
      setMessageType("success");
      setMessage("Appointment status updated successfully.");
    } catch (error) {
      setMessageType("danger");
      setMessage(
        getApiErrorMessage(error, "Unable to update appointment status."),
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="panel">
      <h2 className="h5 d-flex align-items-center gap-2 mb-3">
        <FaCalendarCheck className="text-warning" /> Book Appointment
      </h2>

      {message && (
        <div className={`alert alert-${messageType} py-2`}>{message}</div>
      )}

      <form className="row g-3" onSubmit={bookAppointment}>
        <div className="col-md-6">
          <label className="form-label fw-semibold">Select Doctor</label>
          <select
            className="form-select"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">
              {loading ? "Loading doctors..." : "Choose Doctor"}
            </option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Appointment Date</label>
          <input
            className="form-control"
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Time Slot</label>
          <select
            className="form-select"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          >
            <option value="">Select Time</option>
            <option>09:00 AM</option>
            <option>10:00 AM</option>
            <option>11:00 AM</option>
            <option>12:00 PM</option>
            <option>02:00 PM</option>
            <option>03:00 PM</option>
            <option>04:00 PM</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Patient</label>
          {canSelectPatient ? (
            <select
              className="form-select"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">
                {loading ? "Loading patients..." : "Select Patient"}
              </option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                  {patient.age ? ` (Age: ${patient.age})` : ""}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="form-control"
              value={currentPatientName}
              disabled
              readOnly
            />
          )}
        </div>

        <div className="col-12">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Age</label>
              <input
                className="form-control"
                value={selectedPatient?.age || ""}
                placeholder="Saved in patient profile"
                readOnly
                disabled
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Gender</label>
              <input
                className="form-control"
                value={selectedPatient?.gender || ""}
                placeholder="Saved in patient profile"
                readOnly
                disabled
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Phone</label>
              <input
                className="form-control"
                value={selectedPatient?.phone || ""}
                placeholder="Saved in patient profile"
                readOnly
                disabled
              />
            </div>
          </div>
        </div>

        <div className="col-md-6 d-flex align-items-center">
          <div className="form-check mt-4">
            <input
              className="form-check-input"
              id="emergencyAppointment"
              type="checkbox"
              checked={emergency}
              onChange={(e) => setEmergency(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="emergencyAppointment">
              Emergency Appointment
            </label>
          </div>
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold">
            Symptoms / Problem Description
          </label>
          <textarea
            rows="4"
            className="form-control"
            placeholder="Describe your symptoms..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>

        <div className="col-12">
          <div className="calendar-strip">
            <div>
              <span className="small text-muted">Selected appointment</span>
              <div className="fw-semibold">
                {date ? `${date}${time ? ` at ${time}` : ""}` : "Choose date and time"}
              </div>
            </div>
            <span className="badge text-bg-warning">
              {date
                ? `${selectedDateAppointments.length} booking(s)`
                : "Calendar"}
            </span>
          </div>
        </div>

        <div className="col-12">
          <button
            className="btn btn-primary px-4 d-inline-flex align-items-center gap-2"
            type="submit"
            disabled={loading || submitting}
          >
            <FaCalendarCheck /> {submitting ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </form>

      <div className="mt-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h3 className="h6 mb-0">Patient Appointments</h3>
          <span className="small text-muted">{appointments.length} total</span>
        </div>
        <div className="calendar-list">
          {visibleAppointments.length > 0 ? (
            visibleAppointments.map((appointment) => (
              <div className="calendar-item" key={appointment.id}>
                <div className="calendar-date">{appointment.date}</div>
                <div className="calendar-details">
                  <div className="fw-semibold">{appointment.patientName}</div>
                  <div className="small text-muted">
                    Dr. {appointment.doctorName}
                    {appointment.appointmentTime ? ` - ${appointment.appointmentTime}` : ""}
                  </div>
                  {appointment.symptoms && (
                    <div className="small text-muted text-truncate">
                      {appointment.symptoms}
                    </div>
                  )}
                </div>
                {appointment.emergency && (
                  <span className="badge text-bg-danger">Emergency</span>
                )}
                {canManageStatus ? (
                  <select
                    className="form-select form-select-sm appointment-status-select ms-auto"
                    value={appointment.status || "BOOKED"}
                    onChange={(event) =>
                      updateAppointmentStatus(
                        appointment.id,
                        event.target.value,
                      )
                    }
                    disabled={updatingStatusId === appointment.id}
                    aria-label={`Update status for ${appointment.patientName}`}
                  >
                    <option value="BOOKED">Booked</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                ) : (
                  <span
                    className={`badge ${statusStyles[appointment.status] || "text-bg-light"} ms-auto`}
                  >
                    {appointment.status}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted mb-0">No appointments found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppointmentForm;
