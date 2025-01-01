const AppError = require("../utils/appError");

const handleDuplicateErrorDB = function (error) {
  const keyName = Object.keys(error.keyValue)[0];
  const message = `Duplicate field value: (${error.keyValue[keyName]}). Please use another value`;

  return new AppError(400, message);
};

const handleValidationErrorDB = function (error) {
  const errors = Object.values(error.errors).map((err) => err.message);
  const message = `Invalid data: ${errors.join(". ")}`;

  return new AppError(400, message);
};

const handleJWTError = function (error) {
  return new AppError(401, "Invalid token. Please log in again");
};

const handleJWTExpiredError = function (error) {
  return new AppError(401, "Your token has expired! Please login again");
};

const sendErrorDev = function (err, req, res) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProduction = function (err, req, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong, try again later",
    });
  }
};

module.exports = async function (err, req, res, next) {
  // set status code and status in case an error occured
  // in a place we didn't throw our custom error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // send this type of error if we're in a development environment
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    // make a copy of the error object
    let error = { ...err };
    error.message = err.message;

    if (err.code === 11000) error = handleDuplicateErrorDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError(error);
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError(error);

    sendErrorProduction(error, req, res);
  }
};
