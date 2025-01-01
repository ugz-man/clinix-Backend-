const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");
const Doctor = require("../models/doctorModel");

dotenv.config({ path: "./config.env" });

mongoose
  .connect(`${process.env.PROD_DATABSE}`)
  .then(() => console.log("DB connection successful"));

const doctors = JSON.parse(
  fs.readFileSync(`${__dirname}/doctors.json`, {
    encoding: "utf-8",
  })
);

// Import the data to the database
const importData = async function () {
  try {
    console.log("importing");
    await Doctor.create(doctors);
    console.log("data successfully imported");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete all the data from the database
const deleteData = async function () {
  try {
    console.log("Deleteting data");
    await Doctor.deleteMany();
    console.log("All Data successfully deleted");
  } catch (err) {
    connsole.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
