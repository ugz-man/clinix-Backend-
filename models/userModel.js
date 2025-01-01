const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please tell us your firstname"],
  },
  lastName: {
    type: String,
    required: [true, "Please tell us your lastname"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email address"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valide email address"],
  },
  phone: {
    type: String,
    validate: [validator.isMobilePhone, "Please provide a valid phone number"],
  },
  password: {
    type: String,
    minLength: 8,
    required: [true, "Please provide a password"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  profilePicture: {
    type: String,
    default: "default.jpg",
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "male",
  },
  DOB: {
    type: Date,
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "doctor"],
    default: "user",
  },
  CreatedAt: {
    type: Date,
    default: new Date().toISOString(),
    select: false,
  },
  accountStatus: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpiresAt: Date,
});

userSchema.pre("save", async function (next) {
  // only run this function if the password field was modified
  if (!this.isModified("password")) return next();

  // hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete the passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ accountStatus: { $ne: false } });
  next();
});

userSchema.methods.isPasswordCorrect = async function (
  candidatePassword,
  userPassword
) {
  const result = await bcrypt.compare(candidatePassword, userPassword);
  userPassword.password = undefined;
  return result;
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedPasswordAfterTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedPasswordAfterTimestamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
