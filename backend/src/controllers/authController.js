const User = require('../models/User');
const generateToken = require('../utils/jwtGenerator');
const { validationResult } = require('express-validator');

// @desc    Check auth service health
// @route   GET /api/auth/health
// @access  Public
exports.checkHealth = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Authentication service is healthy'
  });
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { name, email, phone, password, role } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with that email or phone already exists',
      });
    }
    
    // Create user with safe role (never allow admin creation directly)
    const safeRole = role === 'driver' ? 'driver' : 'rider';
    
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: safeRole,
    });
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { email, phone, password } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone',
      });
    }
    
    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: email || '' },
        { phone: phone || '' },
      ],
    }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    
    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact admin.',
      });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        driverDetails: user.driverDetails,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};