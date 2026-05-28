import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../services/api";
import { clearSession, getValidSession, saveSession } from "./authSession";

const persistedSession = getValidSession();
const initialState = {
  token: persistedSession.token,
  email: persistedSession.email,
  role: persistedSession.role,
  fullName: persistedSession.fullName,
  loading: false,
  error: "",
};

export const loginUser = createAsyncThunk("auth/login", async ({ email, password }) => {
  const res = await API.post("/auth/login", { email, password });
  saveSession(res.data);
  return res.data;
});

export const registerUser = createAsyncThunk("auth/register", async (payload) => {
  const { email, password } = payload;
  await API.post("/auth/register", payload);
  const res = await API.post("/auth/login", { email, password });
  saveSession(res.data);
  return res.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = "";
      state.email = "";
      state.role = "";
      state.fullName = "";
      state.error = "";
      clearSession();
    },
    clearAuthError(state) {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.email = action.payload.email;
        state.role = action.payload.role;
        state.fullName = action.payload.fullName || "";
      })
      .addCase(loginUser.rejected, (state) => {
        state.loading = false;
        state.error = "Invalid credentials.";
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.email = action.payload.email;
        state.role = action.payload.role;
        state.fullName = action.payload.fullName || "";
      })
      .addCase(registerUser.rejected, (state) => {
        state.loading = false;
        state.error = "Registration failed. Check the details.";
      });
  },
});

export const { clearAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
