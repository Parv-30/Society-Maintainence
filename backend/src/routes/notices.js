const express = require('express');
const router = express.Router();
const noticesController = require('../controllers/noticesController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.post('/', requireRole('admin'), noticesController.createNotice);
router.get('/', noticesController.getNotices);

module.exports = router;
