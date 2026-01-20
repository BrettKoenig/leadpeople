import express from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

const tagSchema = z.object({
  name: z.string(),
  color: z.string().optional(),
});

// Get all tags
router.get('/', async (req: AuthRequest, res) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { userId: req.userId },
      include: {
        _count: {
          select: { contacts: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create tag
router.post('/', async (req: AuthRequest, res) => {
  try {
    const data = tagSchema.parse(req.body);

    const tag = await prisma.tag.create({
      data: {
        ...data,
        userId: req.userId!,
      },
    });

    res.status(201).json(tag);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update tag
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const data = tagSchema.parse(req.body);

    const tag = await prisma.tag.update({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      data,
    });

    res.json(tag);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete tag
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.tag.delete({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
