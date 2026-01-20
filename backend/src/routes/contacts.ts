import express from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

const contactSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  twitter: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  lastContact: z.string().datetime().optional().nullable(),
  nextFollowUp: z.string().datetime().optional().nullable(),
  relationship: z.string().optional().nullable(),
  importance: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
});

// Get all contacts
router.get('/', async (req: AuthRequest, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.userId },
      include: {
        tags: true,
        interactions: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single contact
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: {
        tags: true,
        interactions: {
          orderBy: { date: 'desc' },
        },
        contactNotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create contact
router.post('/', async (req: AuthRequest, res) => {
  try {
    const data = contactSchema.parse(req.body);
    const { tagIds, ...contactData } = data;

    const contact = await prisma.contact.create({
      data: {
        ...contactData,
        lastContact: data.lastContact ? new Date(data.lastContact) : undefined,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : undefined,
        userId: req.userId!,
        tags: tagIds ? {
          connect: tagIds.map(id => ({ id })),
        } : undefined,
      },
      include: {
        tags: true,
      },
    });

    res.status(201).json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const data = contactSchema.parse(req.body);
    const { tagIds, ...contactData } = data;

    const contact = await prisma.contact.update({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      data: {
        ...contactData,
        lastContact: data.lastContact ? new Date(data.lastContact) : undefined,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : undefined,
        tags: tagIds ? {
          set: tagIds.map(id => ({ id })),
        } : undefined,
      },
      include: {
        tags: true,
      },
    });

    res.json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.contact.delete({
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
