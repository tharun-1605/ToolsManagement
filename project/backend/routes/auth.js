import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get supervisors by company (for operator registration)
router.get('/supervisors/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;
    const supervisors = await User.find({ 
      role: 'supervisor', 
      companyName: companyName,
      isActive: true 
    }).select('name email');
    
    res.json(supervisors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all companies (for operator registration)
router.get('/companies', async (req, res) => {
  try {
    const companies = await User.distinct('companyName', { 
      role: 'supervisor',
      isActive: true 
    });
    
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['shopkeeper', 'supervisor', 'operator'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, shopName, companyName, supervisorEmail } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userData = { name, email, password, role };
    
    if (role === 'shopkeeper' && shopName) {
      userData.shopName = shopName;
    }
    
    if (role === 'supervisor' && companyName) {
      userData.companyName = companyName;
    }
    
    if (role === 'operator' && companyName && supervisorEmail) {
      // Verify supervisor exists in the company
      const supervisor = await User.findOne({ 
        email: supervisorEmail, 
        role: 'supervisor',
        companyName: companyName,
        isActive: true
      });
      
      if (!supervisor) {
        return res.status(400).json({ message: 'Supervisor not found in the specified company' });
      }
      
      userData.companyName = companyName;
      userData.supervisorEmail = supervisorEmail;
    }

    const user = new User(userData);
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopName: user.shopName,
        companyName: user.companyName,
        supervisorEmail: user.supervisorEmail
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopName: user.shopName,
        companyName: user.companyName,
        supervisorEmail: user.supervisorEmail
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      shopName: req.user.shopName,
      companyName: req.user.companyName,
      supervisorEmail: req.user.supervisorEmail
    }
  });
});

export default router;