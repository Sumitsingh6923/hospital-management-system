import axios from "axios";
import { clearSession, isTokenExpired, notifySessionExpired } from "../store/authSession";

const API = axios.create({
  baseURL: "http://localhost:8080"
});

API.interceptors.request.use((req) => {
  if (req.url?.startsWith("/auth/")) {
    return req;
  }

  const token = localStorage.getItem("token");
  if (token) {
    if (isTokenExpired(token)) {
      clearSession();
      notifySessionExpired();
      return Promise.reject(new Error("Session expired. Please login again."));
    }

    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      notifySessionExpired();
    }

    return Promise.reject(error);
  }
);

export default API;
