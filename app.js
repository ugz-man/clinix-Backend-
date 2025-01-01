const express = require("express");
const morgan = require("morgan");
const path = require("path");
// const cookieParser = require("cookie-parser");

const globalErrorHandler = require("./controllers/errorController");

const userRouter = require("./routes/userRoutes");
const doctorRouter = require("./routes/doctorRoutes");

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Global MiddleWares
// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parser ie reading data from the body into req.body
// app.use(express.json({ limit: "10kb" }));
app.use(express.json());
// app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/doctors", doctorRouter);

app.use(globalErrorHandler);

module.exports = app;
