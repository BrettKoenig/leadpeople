import express from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all settings
router.get('/settings', async (req: AuthRequest, res) => {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a setting
router.put('/settings/:key', async (req: AuthRequest, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: {
        key,
        value: String(value),
        type: 'string',
        label: key,
      },
    });

    res.json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize default settings
router.post('/settings/initialize', async (req: AuthRequest, res) => {
  try {
    const defaultSettings = [
      {
        key: 'ALLOW_REGISTRATION',
        value: 'true',
        type: 'boolean',
        label: 'Allow Registration',
        description: 'Allow new users to register for accounts',
      },
      {
        key: 'STRIPE_MODE',
        value: process.env.STRIPE_MODE || 'test',
        type: 'string',
        label: 'Stripe Mode',
        description: 'Current Stripe configuration mode (test or production)',
      },
    ];

    for (const setting of defaultSettings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      });
    }

    const settings = await prisma.setting.findMany();
    res.json(settings);
  } catch (error) {
    console.error('Error initializing settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (for admin management)
router.get('/users', async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        subscription: {
          select: {
            status: true,
            currentPeriodEnd: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle user admin status
router.put('/users/:id/admin', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ error: 'isAdmin must be a boolean' });
    }

    // Prevent removing admin status from yourself
    if (id === req.userId && !isAdmin) {
      return res.status(400).json({ error: 'Cannot remove your own admin status' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isAdmin },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user admin status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
