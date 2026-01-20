import express from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

const interactionSchema = z.object({
  contactId: z.string(),
  type: z.string(),
  date: z.string().datetime(),
  duration: z.number().optional().nullable(),
  description: z.string(),
  location: z.string().optional().nullable(),
  outcome: z.string().optional().nullable(),
  followUp: z.boolean().optional(),
});

// Get all interactions
router.get('/', async (req: AuthRequest, res) => {
  try {
    const interactions = await prisma.interaction.findMany({
      where: { userId: req.userId },
      include: {
        contact: true,
      },
      orderBy: { date: 'desc' },
    });

    res.json(interactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get interactions for a contact
router.get('/contact/:contactId', async (req: AuthRequest, res) => {
  try {
    const interactions = await prisma.interaction.findMany({
      where: {
        contactId: req.params.contactId,
        userId: req.userId,
      },
      orderBy: { date: 'desc' },
    });

    res.json(interactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create interaction
router.post('/', async (req: AuthRequest, res) => {
  try {
    const data = interactionSchema.parse(req.body);

    const interaction = await prisma.interaction.create({
      data: {
        ...data,
        date: new Date(data.date),
        userId: req.userId!,
      },
      include: {
        contact: true,
      },
    });

    // Update last contact date on the contact
    await prisma.contact.update({
      where: { id: data.contactId },
      data: { lastContact: new Date(data.date) },
    });

    res.status(201).json(interaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update interaction
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const data = interactionSchema.parse(req.body);

    const interaction = await prisma.interaction.update({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      data: {
        ...data,
        date: new Date(data.date),
      },
      include: {
        contact: true,
      },
    });

    res.json(interaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete interaction
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.interaction.delete({
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
