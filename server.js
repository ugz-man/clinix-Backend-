const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./app");
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
mongoose
  .connect(`${process.env.PROD_DATABSE}`)
  .then(() => console.log("database connection successful"))
  .catch((err) => console.log("Couldn't connect to the database"));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
