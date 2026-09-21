const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      educationLevel,
      password,
    } = req.body;

    // 1. Check required fields
    if (
      !name ||
      !email ||
      !educationLevel ||
      !password
    ) {
      return res.status(400).json({
        message: "Please complete all fields.",
      });
    }

    // 2. Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters.",
      });
    }

    // 3. Normalize email
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // 4. Check whether user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // 6. Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      educationLevel,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // 7. Send response
    return res.status(201).json({
      message: "Account created successfully.",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        educationLevel: user.educationLevel,
      },
    });


  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Server error while creating account.",
    });
  }
};



// const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // 2. Normalize email
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // 3. Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // 4. Compare password
    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // 5. Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // 6. Send response
    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        educationLevel: user.educationLevel,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error while logging in.",
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
};