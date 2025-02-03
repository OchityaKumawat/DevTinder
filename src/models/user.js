const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      validate: {
        validator: (value) =>
          validator.isAlpha(value, "en-US", { ignore: " " }),
        message: "First name can only contain letters",
      },
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      validate: {
        validator: (value) =>
          validator.isAlpha(value, "en-US", { ignore: " " }),
        message: "Last name can only contain letters",
      },
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Prevent password from being returned in queries
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
      validate: {
        validator: Number.isInteger,
        message: "Age must be an integer",
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "non-binary", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

// **Password Hashing Middleware**
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Hash only if modified

  try {
    this.password = await bcrypt.hash(this.password, 10); // Hash with salt rounds = 10
    next();
  } catch (err) {
    next(err);
  }
});

// **Password Compare Method for Login**
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, "DEV@Tinder$790", {
    expiresIn: "1h", // Set expiration for the token
  });
  return token;
};

module.exports = mongoose.model("User", userSchema);
