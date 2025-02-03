const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://ochityakumawat03:ochityakumawat%401234@devtinder.gpby9.mongodb.net/DevTinder"
  );
};

module.exports = connectDB;
