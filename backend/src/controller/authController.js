const asyncHandler = require('express-async-handler');



import jwt from 'jsonwebtoken'
import User from '@/model/User'

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc   Register new user
// @route  POST /api/auth/signup
// @access Public
const signup = asyncHandler(async (req, res) => {

  const { name, email, password } = req.body;

  // check existing
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  const user = await User.create({ name, email, password });

  // respond with token and user (omit password)
  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    },
    token: generateToken(user._id)
  });
});

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    },
    token: generateToken(user._id)
  });
});

// @desc Get current user (example protected route)
// @route GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ user });
});

module.exports = { signup, login, getMe };
