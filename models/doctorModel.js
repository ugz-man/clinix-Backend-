const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  profilePicture: String,
  name: {
    type: String,
    required: true,
    trim: true,
  },
  specialization: {
    type: String,
    required: true,
    trim: true,
  },
  ratingsAverage: {
    type: Number,
    min: 1.0,
    max: 5.0,
    default: 0,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  yearsOfExperience: {
    type: Number,
    default: 1,
  },
  contactInfo: {
    telephone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  socialMediaLinks: {
    linkedIn: String,
    twitter: String,
    facebook: String,
  },
  about: {
    type: String,
    required: true,
    trim: true,
  },
  education: [
    {
      degree: { type: String, required: true },
      field: { type: String, required: true },
      institution: { type: String, required: true },
      graduationYear: { type: Number, required: true },
    },
  ],
  languages: [String],
  certifications: [
    {
      name: {
        type: String,
        required: true,
      },
      organization: {
        type: String,
        required: true,
      },
      issueYear: {
        type: Number,
        required: true,
      },
    },
  ],
  awards: [
    {
      name: String,
      organization: String,
      year: Number,
    },
  ],
  publications: [
    {
      title: String,
      journal: String,
      year: Number,
      link: String,
    },
  ],
});

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
