const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const {
  validateEditProfileData,
  validatePasswordChange,
} = require("../utils/validate");

const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    // Send user details in the response
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // Check that only allowed fields are sent
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    // Get the authenticated user (populated by userAuth middleware)
    const loggedInUser = req.user;

    // Loop through each allowed field and update the user document if present

    Object.keys(req.body).forEach((field) => {
      loggedInUser[field] = req.body[field];
    });

    // Validate the updated data using Mongoose schema validators.
    // This will catch errors such as invalid lengths, non-letter characters in names, etc.
    const validationError = loggedInUser.validateSync();
    if (validationError) {
      throw new Error(validationError.message);
    }

    // Save the changes. (This will also trigger any pre-save hooks in your schema.)
    await loggedInUser.save();

    // Respond with success (using a plain text message as you prefer thrown errors)
    res.status(200).send("Profile updated successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/edit-password", userAuth, async (req, res) => {
  try {
    // Re-fetch the user with the password included
    const freshUser = await User.findById(req.user._id).select("+password");
    if (!freshUser) {
      throw new Error("User not found");
    }

    // Validate the password change request
    const { oldPassword, newPassword } = validatePasswordChange(req);

    // Compare old password with stored hash
    const isMatch = await bcrypt.compare(oldPassword, freshUser.password);
    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    // Instead of manually hashing, assign the new password directly
    freshUser.password = newPassword;
    await freshUser.save();

    res.status(200).send("Password updated successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = profileRouter;
