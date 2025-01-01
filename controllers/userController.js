const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const User = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");
const AppError = require("../utils/appError");

const multerStorage = multer.memoryStorage();

const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload an image", 400), false);
  }
};

// Create a multer instance
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const uploadUserPhoto = upload.single("profilePicture");

const resizeProfilePicture = catchAsyncError(async function (req, res, next) {
  if (!req.file) return next();

  //   create a unique name for the image file
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  //   manipulate the image
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 50 })
    .toFile(path.join("public", "images", "users", req.file.filename));

  // go to the next middleware
  next();
});

const updateMe = catchAsyncError(async function (req, res) {
  // get the fileds to update in the database
  const newUpdates = {
    firstName: req?.body?.firstName,
    lastName: req?.body?.lastName,
    email: req?.body?.email,
    phone: req?.body?.phone,
    DOB: req?.body?.DOB,
    gender: req?.body?.gender,
    address: req?.body?.address,
  };

  //   if there is an image file, set the profie picture field
  // to the name of the file
  if (req.file) newUpdates.profilePicture = req.file.filename;

  //   perform the actual update of the user in the database
  const updatedUser = await User.findByIdAndUpdate(req.user.id, newUpdates, {
    new: true,
    runValidators: true,
  });

  // modify the image name to include the link to the image
  if (updatedUser.profilePicture !== "default.jpg")
    updatedUser.profilePicture = `${req.protocol}://${req.get("host")}/images/users/${updatedUser.profilePicture}`;

  //   return the response with the status code
  res.status(200).json({ status: "success", data: { user: updatedUser } });
});

module.exports = { uploadUserPhoto, resizeProfilePicture, updateMe };
