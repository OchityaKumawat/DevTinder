const validator = require("validator");

const validateEditProfileData = (req) => {
  const allowedEditFields = ["firstName", "lastName", "age", "gender"];
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  return isEditAllowed;
};

const validatePasswordChange = (req) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new Error("Both old and new passwords are required");
  }

  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters long");
  }

  if (!validator.isStrongPassword(newPassword)) {
    throw new Error(
      "New password must contain uppercase, lowercase, number, and special character"
    );
  }

  return { oldPassword, newPassword };
};

module.exports = {
  validateEditProfileData,
  validatePasswordChange,
};
