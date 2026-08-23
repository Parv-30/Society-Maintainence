const { z } = require('zod');
const prisma = require('../utils/prisma');

const categorySchema = z.object({
  overdueThresholdDays: z.number().min(1),
});

exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const data = categorySchema.parse(req.body);
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { overdueThresholdDays: data.overdueThresholdDays }
    });
    res.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
