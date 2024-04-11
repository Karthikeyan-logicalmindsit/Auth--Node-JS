const mongoose = require("mongoose");

const connect = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  try {
    await mongoose.connect(MONGODB_URI, {});
    console.log("MongoDB Connected SuccesFully");
  } catch (error) {
    console.log("MongoDB Connection Error", error);
    process.exit(1);
  }
};

module.exports = connect;
