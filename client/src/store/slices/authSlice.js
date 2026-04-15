import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("access-token") || null,
  isAuthenticated: !!localStorage.getItem("access-token"),
  user: null,
  role: localStorage.getItem("user-role") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setRole: (state, action) => {
      state.role = action.payload;
      if (action.payload) {
        localStorage.setItem("user-role", action.payload);
      }
    },
    setLogin: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("access-token", action.payload);
    },
    setLogout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      localStorage.removeItem("access-token");
      localStorage.removeItem("user-role");
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setLogin, setLogout, setUser, setRole } = authSlice.actions;
export default authSlice.reducer;
