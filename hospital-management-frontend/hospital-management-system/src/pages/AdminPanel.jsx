import { useEffect, useState } from "react";
import { FaSave, FaTrash, FaUsersCog } from "react-icons/fa";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const roles = ["ADMIN", "DOCTOR", "PATIENT"];

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/api/admin/users");
      setUsers(res.data);
    } catch (error) {
      setMessageType("danger");
      setMessage(error.response?.data?.message || "Only admins can view this panel.");
    }
  };

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      try {
        const res = await API.get("/api/admin/users");
        if (active) {
          setUsers(res.data);
        }
      } catch (error) {
        if (active) {
          setMessageType("danger");
          setMessage(error.response?.data?.message || "Only admins can view this panel.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const updateLocalRole = (id, role) => {
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, role } : user)));
  };

  const saveRole = async (user) => {
    try {
      setSavingUserId(user.id);
      await API.put(`/api/admin/users/${user.id}/role`, { role: user.role });
      await fetchUsers();
      setMessageType("success");
      setMessage("Role updated successfully.");
    } catch (error) {
      setMessageType("danger");
      setMessage(error.response?.data?.message || "Unable to update role.");
    } finally {
      setSavingUserId(null);
    }
  };

  const deleteUser = async (id) => {
    try {
      setSavingUserId(id);
      await API.delete(`/api/admin/users/${id}`);
      await fetchUsers();
      setMessageType("success");
      setMessage("User deleted successfully.");
    } catch (error) {
      setMessageType("danger");
      setMessage(error.response?.data?.message || "Unable to delete user.");
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        <div className="page-title">
          <h1 className="h2 fw-bold d-flex align-items-center gap-2">
            <FaUsersCog className="text-primary" /> Admin Panel
          </h1>
          <p className="text-muted mb-0">Assign admin, doctor, and patient roles from one place.</p>
        </div>

        {message && <div className={`alert alert-${messageType} py-2`}>{message}</div>}

        <div className="row g-3 mb-4">
          {roles.map((role) => (
            <div className="col-md-4" key={role}>
              <div className="stat-card">
                <div>
                  <p className="text-muted small mb-1">{role.toLowerCase()} accounts</p>
                  <h2 className="h4 mb-0">{loading ? "..." : users.filter((user) => user.role === role).length}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="panel table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="fw-semibold">{user.email}</td>
                  <td>
                    <select
                      className="form-select form-select-sm role-select"
                      value={user.role}
                      onChange={(e) => updateLocalRole(user.id, e.target.value)}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => saveRole(user)}
                        disabled={savingUserId === user.id}
                      >
                        <FaSave />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteUser(user.id)}
                        disabled={savingUserId === user.id}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td className="text-muted" colSpan="3">Loading users...</td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td className="text-muted" colSpan="3">No users found.</td>
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

export default AdminPanel;
