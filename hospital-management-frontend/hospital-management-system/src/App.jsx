import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import Patients from "./pages/Patients";
import AdminPanel from "./pages/AdminPanel";
import DoctorPanel from "./pages/DoctorPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import { logout } from "./store/authSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleExpiredSession = () => dispatch(logout());
    window.addEventListener("auth:expired", handleExpiredSession);

    return () => window.removeEventListener("auth:expired", handleExpiredSession);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctors"
          element={
            <ProtectedRoute>
              <Doctors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "DOCTOR"]}>
              <Patients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-panel"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
