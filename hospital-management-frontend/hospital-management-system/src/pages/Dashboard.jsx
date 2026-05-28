import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaCalendarDay, FaCalendarCheck, FaChartLine, FaUserMd, FaUsersCog } from "react-icons/fa";
import { MdPersonalInjury } from "react-icons/md";
import API from "../services/api";
import Navbar from "../components/Navbar";
import DoctorList from "../components/DoctorList";
import PatientList from "../components/PatientList";
import AppointmentForm from "../components/AppointmentForm";
import Footer from "../components/Footer";

function Dashboard() {
  const { role = "PATIENT", email = "", fullName = "" } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState({ doctors: [], patients: [], appointments: [] });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const profileName = [...analytics.doctors, ...analytics.patients]
    .find((profile) => profile.email === email)?.name;
  const displayName = fullName || profileName || email.split("@")[0] || "User";

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);

    try {
      const requests = [
        API.get("/api/doctors"),
        API.get("/api/appointments"),
      ];

      if (role !== "PATIENT") {
        requests.push(API.get("/api/patients"));
      }

      const [doctorRes, appointmentRes, patientRes] = await Promise.allSettled(requests);

      setAnalytics({
        doctors: doctorRes.status === "fulfilled" ? doctorRes.value.data : [],
        appointments: appointmentRes.status === "fulfilled" ? appointmentRes.value.data : [],
        patients: patientRes?.status === "fulfilled" ? patientRes.value.data : [],
      });
    } catch {
      setAnalytics({ doctors: [], patients: [], appointments: [] });
    } finally {
      setLoadingAnalytics(false);
    }
  }, [role]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const chartData = useMemo(() => {
    const totalsByDate = analytics.appointments.reduce((totals, appointment) => {
      totals[appointment.date] = (totals[appointment.date] || 0) + 1;
      return totals;
    }, {});

    return Object.entries(totalsByDate)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .slice(0, 7)
      .map(([date, total]) => ({ date, total }));
  }, [analytics.appointments]);

  const maxAppointments = Math.max(...chartData.map((item) => item.total), 1);
  const today = new Date().toISOString().slice(0, 10);
  const todaysAppointments = analytics.appointments.filter((appointment) => appointment.date === today).length;

  const specializationData = useMemo(() => {
    const totalsBySpecialization = analytics.doctors.reduce((totals, doctor) => {
      const specialization = doctor.specialization || "General";
      totals[specialization] = (totals[specialization] || 0) + 1;
      return totals;
    }, {});

    return Object.entries(totalsBySpecialization)
      .sort(([, totalA], [, totalB]) => totalB - totalA)
      .slice(0, 5)
      .map(([label, total]) => ({ label, total }));
  }, [analytics.doctors]);

  const patientGrowthData = useMemo(() => {
    const appointmentsByPatient = new Map();

    analytics.appointments.forEach((appointment) => {
      if (!appointment.patientId || !appointment.date) {
        return;
      }

      const currentDate = appointmentsByPatient.get(appointment.patientId);
      if (!currentDate || appointment.date < currentDate) {
        appointmentsByPatient.set(appointment.patientId, appointment.date);
      }
    });

    const totalsByDate = Array.from(appointmentsByPatient.values()).reduce((totals, date) => {
      totals[date] = (totals[date] || 0) + 1;
      return totals;
    }, {});

    return Object.entries(totalsByDate)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .slice(0, 7)
      .map(([date, total]) => ({ date, total }));
  }, [analytics.appointments]);

  const maxSpecializations = Math.max(...specializationData.map((item) => item.total), 1);
  const maxPatientGrowth = Math.max(...patientGrowthData.map((item) => item.total), 1);
  const totalPatients = role === "PATIENT" ? 1 : analytics.patients.length;

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        <section className="dashboard-hero mb-4">
          <div>
            <span className="badge text-bg-light mb-2">{role}</span>
            <h1 className="h2 fw-bold mb-2">Hospital Admin Dashboard</h1>
            <p className="mb-0 text-muted">Welcome - {displayName}</p>
          </div>
          {role === "ADMIN" && (
            <Link className="btn btn-primary d-inline-flex align-items-center gap-2" to="/admin">
              <FaUsersCog /> Open Admin Panel
            </Link>
          )}
        </section>

        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3">
            <div className="stat-card">
              <FaUserMd className="stat-icon text-primary" />
              <div>
                <p className="text-muted small mb-1">Total Doctors</p>
                <h2 className="h4 mb-0">{loadingAnalytics ? "..." : analytics.doctors.length}</h2>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="stat-card">
              <MdPersonalInjury className="stat-icon text-success" />
              <div>
                <p className="text-muted small mb-1">Total Patients</p>
                <h2 className="h4 mb-0">{loadingAnalytics ? "..." : totalPatients}</h2>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="stat-card">
              <FaCalendarCheck className="stat-icon text-warning" />
              <div>
                <p className="text-muted small mb-1">Total Appointments</p>
                <h2 className="h4 mb-0">{loadingAnalytics ? "..." : analytics.appointments.length}</h2>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="stat-card">
              <FaCalendarDay className="stat-icon text-info" />
              <div>
                <p className="text-muted small mb-1">Today's Appointments</p>
                <h2 className="h4 mb-0">{loadingAnalytics ? "..." : todaysAppointments}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-7">
            <div className="panel h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h5 mb-0 d-flex align-items-center gap-2">
                  <FaCalendarCheck className="text-warning" /> Appointments Per Day
                </h2>
                <span className="badge text-bg-light">Next 7 booking dates</span>
              </div>

              <div className="appointment-chart">
                {chartData.length > 0 ? (
                  chartData.map((item) => (
                    <div className="chart-row" key={item.date}>
                      <div className="chart-label">{item.date}</div>
                      <div className="chart-track">
                        <div className="chart-bar" style={{ width: `${(item.total / maxAppointments) * 100}%` }} />
                      </div>
                      <div className="chart-value">{item.total}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted mb-0">No appointments booked yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="panel h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h5 mb-0 d-flex align-items-center gap-2">
                  <FaChartLine className="text-success" /> Patient Growth
                </h2>
                <span className="badge text-bg-light">First visits</span>
              </div>

              <div className="mini-bars">
                {patientGrowthData.length > 0 ? (
                  patientGrowthData.map((item) => (
                    <div className="mini-bar" key={item.date}>
                      <div className="mini-bar-fill" style={{ height: `${(item.total / maxPatientGrowth) * 100}%` }} />
                      <span>{item.total}</span>
                      <small>{item.date.slice(5)}</small>
                    </div>
                  ))
                ) : (
                  <p className="text-muted mb-0">No patient visit history yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="panel">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h5 mb-0 d-flex align-items-center gap-2">
                  <FaUserMd className="text-primary" /> Doctors By Specialization
                </h2>
                <span className="badge text-bg-light">Top 5</span>
              </div>

              <div className="specialization-grid">
                {specializationData.length > 0 ? (
                  specializationData.map((item) => (
                    <div className="specialization-item" key={item.label}>
                      <div className="d-flex justify-content-between gap-3">
                        <span>{item.label}</span>
                        <strong>{item.total}</strong>
                      </div>
                      <div className="chart-track">
                        <div className="chart-bar chart-bar-success" style={{ width: `${(item.total / maxSpecializations) * 100}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted mb-0">No doctor specializations available yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className={role === "PATIENT" ? "col-12" : "col-lg-6"}>
            <DoctorList />
          </div>
          {role !== "PATIENT" && (
            <div className="col-lg-6">
              <PatientList />
            </div>
          )}
          <div className="col-12">
            <AppointmentForm onAppointmentChange={loadAnalytics} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
