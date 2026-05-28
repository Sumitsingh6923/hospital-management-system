import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaLock, FaPhoneAlt, FaUser, FaUserPlus } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { clearAuthError, registerUser } from "../store/authSlice";
import AppLogo from "../components/AppLogo";
import { specializationOptions } from "../constants/specializations";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [role, setRole] = useState("PATIENT");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate, token]);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(registerUser({
      email,
      password,
      role,
      fullName,
      age: age ? Number(age) : null,
      gender,
      phone,
      address,
      specialization,
    }));
  };

  return (
    <div className="auth-page">
      <div className="container py-5">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-lg-5 col-md-7">
            <div className="auth-card border-0 shadow-sm">
              <div className="text-center mb-4">
                <AppLogo size="lg" className="justify-content-center mb-3" />
                <h1 className="h3 fw-bold mb-1">Create Account</h1>
              </div>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaUser /></span>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={role === "PATIENT" || role === "DOCTOR"}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <div className="input-group">
                    <span className="input-group-text"><MdEmail /></span>
                    <input
                      className="form-control"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaLock /></span>
                    <input
                      className="form-control"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {role === "PATIENT" && (
                  <>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Age</label>
                        <input
                          className="form-control"
                          type="number"
                          min="1"
                          max="120"
                          placeholder="Age"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-select"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3 mt-3">
                      <label className="form-label">Phone Number</label>
                      <div className="input-group">
                        <span className="input-group-text"><FaPhoneAlt /></span>
                        <input
                          className="form-control"
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Address <span className="text-muted">(optional)</span></label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Enter address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {role === "DOCTOR" && (
                  <div className="mb-3">
                    <label className="form-label">Specialization</label>
                    <select
                      className="form-select"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      required
                    >
                      <option value="">Select Specialization</option>
                      {specializationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  className="btn btn-primary w-100 d-inline-flex justify-content-center align-items-center gap-2"
                  type="submit"
                  disabled={loading}
                >
                  <FaUserPlus />
                  {loading ? "Creating account..." : "Register"}
                </button>
              </form>

              <div className="text-center mt-3">
                <Link className="btn btn-link" to="/">
                  Already have an account? Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
