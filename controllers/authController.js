const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsyncError = require("../utils/catchAsyncError");

function createJsonWebToken(id, expiresIn) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });
}

// function setCookieOnResponse(expires, cookieName, cookieValue, response) {
//   const cookieOptions = {
//     expires,
//     httpOnly: true,
//   };
//   if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
//   response.cookie(cookieName, cookieValue, cookieOptions);
// }

const protect = catchAsyncError(async function (req, res, next) {
  // Get the token and see if it exists
  let token;
  if (
    req.headers?.authorization &&
    req.headers?.authorization?.startsWith("Bearer")
  ) {
    token = req.headers?.authorization.split(" ")[1];
  }

  if (!token) {
    next(
      new AppError(401, "You are not logged in! Please log in to gain access")
    );
    return;
  }

  // validate the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    next(
      new AppError(401, "The user belonging to this token does no longer exist")
    );
    return;
  }

  // check if the user changed password after the token was issued
  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    next(
      new AppError(401, "User recently changed password! Please log in again")
    );
    return;
  }

  // Grant access to the user
  req.user = currentUser;
  next();
});

const signUp = catchAsyncError(async function signUp(req, res) {
  // create a new user in the database
  const newUser = await User.create({
    firstName: req?.body?.firstName,
    lastName: req?.body?.lastName,
    email: req?.body?.email,
    password: req?.body?.password,
    passwordConfirm: req?.body?.passwordConfirm,
    DOB: req?.body?.DOB,
    address: req?.body?.address,
    gender: req?.body?.gender,
    phone: req?.body?.phone,
  });

  // remove this fields from the response
  newUser.password = undefined;
  newUser.accountStatus = undefined;

  // create token and set cookie on the response
  const { rememberMe } = req.body;
  const expiryTime = rememberMe
    ? process.env.JWT_EXPIRES_IN_LONG
    : process.env.JWT_EXPIRES_IN_SHORT;
  const token = createJsonWebToken(newUser._id, expiryTime);

  // const cookieExpiresIn = new Date(
  //   Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  // );
  // setCookieOnResponse(cookieExpiresIn, "jwt", token, res);

  // send the response to the client
  res.status(200).json({ status: "success", token, data: { user: newUser } });
});

const signIn = catchAsyncError(async function (req, res, next) {
  const { email, password } = req.body;

  // check if the user and email exists on the request body
  if (!email || !password) {
    next(new AppError(400, "Please provide an email and password"));
    return;
  }

  // check if the user exists and the password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    next(new AppError(401, "Username and Password combination not correct"));
    return;
  }

  // clear the password field frm=om the object
  user.password = undefined;

  // if everything is okay send token to the user
  const { rememberMe } = req.body;
  const expiryTime = rememberMe
    ? process.env.JWT_EXPIRES_IN_LONG
    : process.env.JWT_EXPIRES_IN_SHORT;
  const token = createJsonWebToken(user._id, expiryTime);

  // const cookieExpiresIn = new Date(
  //   Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  // );
  // setCookieOnResponse(cookieExpiresIn, "jwt", token, res);

  res.status(200).json({ status: "success", token, data: { user } });
});

const signOut = catchAsyncError(async function (req, res) {
  const token = req?.headers?.authorization.split(" ")[1];

  // const cookieExpiresIn = new Date(Date.now() + 1 * 1000);
  // setCookieOnResponse(cookieExpiresIn, "jwt", "signout", res);

  res.status(200).json({ status: "success" });
});

const isloggedIn = catchAsyncError(async function (req, res) {
  // modify the image name to include the link to the image
  if (req.user.profilePicture !== "default.jpg")
    req.user.profilePicture = `${req.protocol}://${req.get("host")}/images/users/${req.user.profilePicture}`;

  return res
    .status(200)
    .json({ status: "success", isloggedIn: true, data: req.user });
});

module.exports = { protect, signUp, signIn, signOut, isloggedIn };
