import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../utils/api';

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { category } = getState();
      // Only fetch if we don't have categories or they were fetched more than 5 minutes ago
      if (category.items.length > 0 && (Date.now() - category.lastFetched < 300000)) {
        return category.items;
      }
      
      const response = await api.get('/category');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    items: [],
    loading: false,
    error: null,
    lastFetched: null
  },
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
