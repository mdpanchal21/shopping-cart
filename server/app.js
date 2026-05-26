const express = require("express");
const app = express();
const PORT = 5000;
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("./utils/logger");

dotenv.config();
connectDB();

const routes = require("./index");

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// HTTP Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use("/uploads", express.static("uploads"));
app.use(routes);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
