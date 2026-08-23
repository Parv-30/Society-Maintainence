const express = require('express');
const router = express.Router();
const complaintsController = require('../controllers/complaintsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', complaintsController.createComplaint);
router.get('/mine', complaintsController.getMine);
router.get('/:id/history', complaintsController.getHistory);
router.post('/:id/feedback', complaintsController.submitFeedback);

module.exports = router;
