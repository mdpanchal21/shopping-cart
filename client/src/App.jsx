import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'
import ProductDetails from './pages/ProductDetails'
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "./pages/admin/AdminLayout";
import Products from "./pages/admin/Products";
import ProductInfo from "./pages/admin/ProductInfo";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import Orders from "./pages/admin/Orders";
import OrderInfo from "./pages/admin/OrderInfo";
import Users from "./pages/admin/Users";
import UserInfo from "./pages/admin/UserInfo";
import Categories from "./pages/admin/Categories";

function AppWrapper() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith("/admin");
  const showLayout = !isAuthPage && !isAdminPage;

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
      {showLayout && <Header />}

      <main className={showLayout ? "flex-1" : "flex-1 w-full"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/mycart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/products" replace />} />
            <Route path="products" element={<Products />} />
            <Route path="products/info/:id" element={<ProductInfo />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderInfo />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserInfo />} />
            <Route path="categories" element={<Categories />} />
          </Route>
        </Routes>
      </main>

      {showLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        theme="dark"
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
}

export default App;
