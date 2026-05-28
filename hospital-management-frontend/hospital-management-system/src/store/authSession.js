const sessionKeys = ["token", "email", "role", "fullName"];

export const clearSession = () => {
  sessionKeys.forEach((key) => localStorage.removeItem(key));
};

export const saveSession = (payload) => {
  localStorage.setItem("token", payload.token);
  localStorage.setItem("email", payload.email);
  localStorage.setItem("role", payload.role);
  localStorage.setItem("fullName", payload.fullName || "");
};

export const getSession = () => ({
  token: localStorage.getItem("token") || "",
  email: localStorage.getItem("email") || "",
  role: localStorage.getItem("role") || "",
  fullName: localStorage.getItem("fullName") || "",
});

export const getJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = getJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
};

export const getValidSession = () => {
  const session = getSession();
  if (session.token && isTokenExpired(session.token)) {
    clearSession();
    return { token: "", email: "", role: "", fullName: "" };
  }

  return session;
};

export const notifySessionExpired = () => {
  window.dispatchEvent(new Event("auth:expired"));
};
