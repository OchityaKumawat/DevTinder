const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { userAuth } = require("./middlewares/auth");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());
// Add user
app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password, age, gender } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !emailId || !password) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided." });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists." });
    }

    // Create user (use only expected fields to prevent injection)
    const user = new User({
      firstName,
      lastName,
      emailId,
      password,
      age,
      gender,
    });

    // Save user
    await user.save();

    res
      .status(201)
      .json({ message: `User ${user.firstName} signed up successfully.` });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// **Login Route**
app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // Validate request body
    if (!emailId || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Find user by emailId
    const user = await User.findOne({ emailId }).select("+password"); // Explicitly select password
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Use the comparePassword method to verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (isPasswordValid) {
      // Create a JWT Token
      const token = await user.getJWT();

      // Add the token to the cookie and send the response back to the user
      res.cookie("token", token, { httpOnly: true }); // httpOnly helps secure the token in the browser
      res.status(200).send("Login Successful!!!");
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    // Send user details in the response
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Connected to the database");
    app.listen(3000, () => {
      console.log("Server running at port: ");
    });
  })
  .catch((err) => {
    console.err("Database cannot be connected!");
  });
