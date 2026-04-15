import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../utils/api";

const getGuestCart = () => {
  const match = document.cookie.match(/guest_cart=([^;]+)/);
  return match ? JSON.parse(decodeURIComponent(match[1])) : [];
};

const setGuestCart = (cart) => {
  document.cookie = `guest_cart=${encodeURIComponent(
    JSON.stringify(cart)
  )}; path=/; max-age=${60 * 60 * 24 * 7}`;
};

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (!auth.token) {
    return getGuestCart();
  }
  try {
    const res = await api.get("/users/cart");
    if (res.data.data?.products) {
      return res.data.data.products
        .filter((p) => p.product !== null)
        .map((p) => ({
          id: p.product._id,
          title: p.product.name,
          price: p.product.price,
          image: p.product.image?.[0]
            ? `${import.meta.env.VITE_BASE_URL}${p.product.image[0]}`
            : null,
          description: p.product.description,
          category: p.product.category?.slug,
          quantity: p.quantity,
        }));
    }
    return [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch cart");
  }
});

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }

      if (!localStorage.getItem("access-token")) {
        setGuestCart(state.items);
      }
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      const existing = state.items.find((i) => i.id === id);
      if (existing) {
        if (existing.quantity === 1) {
          state.items = state.items.filter((i) => i.id !== id);
        } else {
          existing.quantity -= 1;
        }
      }

      if (!localStorage.getItem("access-token")) {
        setGuestCart(state.items);
      }
    },
    setCartItems: (state, action) => {
      state.items = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      if (!localStorage.getItem("access-token")) {
        document.cookie = "guest_cart=; path=/; max-age=0";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addToCart, removeFromCart, setCartItems, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
