import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;
      console.log("[Auth] Token expired. Attempting refresh...");

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/auth/newAccessToken`,
          {},
          { withCredentials: true }
        );

        const newToken = response.data.accessToken;
        if (newToken) {
          console.log("[Auth] Refresh successful. Syncing token.");
          localStorage.setItem("access-token", newToken);
        }

        return api(originalRequest);
      } catch (refreshError) {
        console.error(" [Auth] Refresh failed. Redirecting to login.");
        localStorage.removeItem("access-token");
        localStorage.removeItem("user-role");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
export default api;