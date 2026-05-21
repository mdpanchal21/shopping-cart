# 🛒 Vetted-Ecom: Comprehensive MERN E-commerce Platform

Vetted-Ecom is a feature-rich, full-stack e-commerce solution designed with a focus on high-end user experience and robust administrative control. Built using the MERN stack (MongoDB, Express, React, Node.js), it provides a complete end-to-end shopping experience—from product discovery to secure payment.

---

## 🌟 Key Modules & Features

### 🛍️ Customer Experience
- **Smart Discovery:** Modern Shop page with real-time text search and category-based filtering.
- **Premium Product Gallery:** Amazon-style product details page featuring a vertical thumbnail sidebar, high-resolution main image viewer with hover-zoom effect, and structured product meta-info.
- **Dynamic Cart Management:** Full-featured shopping cart allowing users to update quantities, remove items, and see price calculations instantly.
- **Secure Checkout:** Integrated **Razorpay Payment Gateway** for safe and seamless credit/debit card transactions.
- **User Ecosystem:** Complete user lifecycle including Registration, Login, Profile Management, and Order History tracking.

### 🛡️ Administrative Suite
- **Advanced Product Management:**
  - Dedicated CRUD interface for products.
  - **Drag & Drop Media Zone:** Modern multi-image upload interface.
  - **Visual Reordering:** Intuitive controls to swap product image positions, with automatic "Main" image designation.
- **Category Control:** Comprehensive management of product categories to organize the storefront.
- **Order Tracking:** Real-time visibility into customer orders with status management.
- **User Analytics:** Admin tools to view and manage user accounts and information.
- **Custom Form Schema:** Flexible system for dynamic form configurations and data capture.

---

## 💻 Technical Architecture

### Frontend (Client)
- **Framework:** React 19 with Vite (Lightning-fast HMR).
- **Styling:** Tailwind CSS 4 for utility-first, performant UI.
- **State Management:** Redux Toolkit for predictable, centralized state.
- **Routing:** React Router 7 for precise navigation and path handling.
- **Icons:** Lucide React for consistent, high-end iconography.

### Backend (Server)
- **Runtime:** Node.js & Express.js.
- **Database:** MongoDB with Mongoose for schema-based data modeling.
- **Validation:** Joi for strict incoming data validation and error handling.
- **Security:** JWT (JSON Web Tokens) for stateless authentication; Bcrypt for secure password hashing.
- **file Handling:** Multer for efficient multi-file product image uploads.

---

## 📥 Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local installation.
- Razorpay API keys (for payments).

### 2. Environment Variables
Create a `.env` in the **server** directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_key
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Create a `.env` in the **client** directory:
```env
VITE_BASE_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_id
```

### 3. Start the Platform
```bash
# In Root Directory
cd server && npm install && npm start
cd ../client && npm install && npm run dev
```

---
Built with ❤️ by [Mayank Panchal](https://github.com/mdpanchal21)
