import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { isTokenExpired } from "../store/authSession";

function ProtectedRoute({ children, allowedRoles }) {
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);
  const expired = token ? isTokenExpired(token) : false;

  useEffect(() => {
    if (expired) {
      dispatch(logout());
    }
  }, [dispatch, expired]);

  if (!token || expired) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default ProtectedRoute;
