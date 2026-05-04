import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import categoryReducer from "./slices/categorySlice";
import loadingReducer from "./slices/loadingSlice";
import formSchemaReducer from "./slices/formSchemaSlice";


export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    category: categoryReducer,
    loading: loadingReducer,
    formSchema: formSchemaReducer,
  },
});


export default store;
