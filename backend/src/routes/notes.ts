import express from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

const noteSchema = z.object({
  contactId: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  content: z.string(),
});

// Get all notes
router.get('/', async (req: AuthRequest, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.userId },
      include: {
        contact: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create note
router.post('/', async (req: AuthRequest, res) => {
  try {
    const data = noteSchema.parse(req.body);

    const note = await prisma.note.create({
      data: {
        ...data,
        userId: req.userId!,
      },
      include: {
        contact: true,
      },
    });

    res.status(201).json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update note
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const data = noteSchema.parse(req.body);

    const note = await prisma.note.update({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      data,
      include: {
        contact: true,
      },
    });

    res.json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete note
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.note.delete({
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
