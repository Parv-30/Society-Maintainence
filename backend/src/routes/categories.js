const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', categoriesController.getCategories);
router.patch('/:id', authenticate, requireRole('admin'), categoriesController.updateCategory);

module.exports = router;
