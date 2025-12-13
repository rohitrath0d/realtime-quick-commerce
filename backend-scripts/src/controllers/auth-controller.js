import { User } from "../models/user.js";
import jwt from 'jsonwebtoken';

export const registerController = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // if (!name || !email || !password || !role) {
    //   return res.status(400).json({
    //     message: "Please fill up the missing fields!"
    //   })
    // }
    if (!name || !email || !password || !role) {  // handled by error handler middleware
      throw new Error("Please fill up the missing fields!");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error("Email already exists. Please log in.");
    };

    // hashing password -done in schema format - If try to hash here manually, it could lead to double hashing, which would break login.

    const newUser = await User.create({
      name,
      email,
      password,     // Already hashed automatically by schema
      role
    });

    // before signing - checking env
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({
      id: newUser._id,
      role: newUser.role
    }, process.env.JWT_SECRET, { expiresIn: "7d", issuer: "quick-ecomm-app", audience: "quick-ecomm-app-users" });

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Register API",
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Email and Password is required");
    }

    const loginUser = await User.findOne({ email });
    if (!loginUser) {
      throw new Error("User does not exist. Please register.");
    };

    const isMatch = await loginUser.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // token
    const token = jwt.sign({
      id: loginUser._id,
      role: loginUser.role
    }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      user: {
        id: loginUser._id,
        name: loginUser.name,
        email: loginUser.email,
        role: loginUser.role
      }, token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
