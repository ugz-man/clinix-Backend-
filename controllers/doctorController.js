const catchAsyncError = require("../utils/catchAsyncError");
const Doctor = require("../models/doctorModel");
const APIFeatures = require("../utils/APIFeatures");

const getAllDoctors = catchAsyncError(async function (req, res, next) {
  const features = new APIFeatures(Doctor.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const doctors = await features.query;

  return res
    .status(200)
    .json({ status: "success", results: doctors.length, data: { doctors } });
});

const getDoctor = catchAsyncError(async function (req, res, next) {
  const doctor = await Doctor.findById(req.params.id);

  return res.status(200).json({ status: "success", data: { doctor } });
});

const getTotalCount = catchAsyncError(async function (req, res, next) {
  const stats = await Doctor.aggregate([
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
    {
      $project: { _id: 0 },
    },
  ]);
  return res.status(200).json({ status: "success", data: { stats } });
});

module.exports = { getAllDoctors, getDoctor, getTotalCount };
