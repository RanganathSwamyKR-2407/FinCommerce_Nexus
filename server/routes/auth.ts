import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { generateToken, verifyToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Please provide email, password, and your full name.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.createUser({
      email,
      passwordHash,
      name,
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const { passwordHash: _, ...safeUser } = user;

    res.status(201).json({
      message: 'Account successfully registered.',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both your email address and password.' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const { passwordHash: _, ...safeUser } = user;

    res.json({
      message: 'Successfully signed in.',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req: AuthRequest, res) => {
  try {
    const user = await db.findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error: any) {
    console.error('Error in auth me:', error);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { name, phone, addressLine1, city, postalCode, country } = req.body;

    const updated = await db.updateUserProfile(req.user!.id, {
      ...(name ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(addressLine1 !== undefined ? { addressLine1 } : {}),
      ...(city !== undefined ? { city } : {}),
      ...(postalCode !== undefined ? { postalCode } : {}),
      ...(country !== undefined ? { country } : {}),
    });

    if (!updated) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { passwordHash: _, ...safeUser } = updated;
    res.json({ message: 'Profile updated successfully.', user: safeUser });
  } catch (error: any) {
    console.error('Error in update profile:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
