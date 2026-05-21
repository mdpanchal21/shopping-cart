import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../utils/api";

export const fetchAllSchemas = createAsyncThunk(
  "formSchema/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/form-schema");
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch schemas");
    }
  }
);

const formSchemaSlice = createSlice({
  name: "formSchema",
  initialState: {
    schemas: JSON.parse(localStorage.getItem("form-schemas")) || {},
    loading: false,
    error: null,
    lastFetched: localStorage.getItem("form-schemas-last-fetched") || null,
  },
  reducers: {
    clearSchemas: (state) => {
      state.schemas = {};
      state.lastFetched = null;
      localStorage.removeItem("form-schemas");
      localStorage.removeItem("form-schemas-last-fetched");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSchemas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSchemas.fulfilled, (state, action) => {
        state.loading = false;
        state.schemas = action.payload;
        const now = Date.now();
        state.lastFetched = now;
        localStorage.setItem("form-schemas", JSON.stringify(action.payload));
        localStorage.setItem("form-schemas-last-fetched", now.toString());
      })
      .addCase(fetchAllSchemas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSchemas } = formSchemaSlice.actions;
export default formSchemaSlice.reducer;
