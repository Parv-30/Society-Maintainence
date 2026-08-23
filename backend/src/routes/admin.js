const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('admin'));

router.get('/complaints', adminController.getComplaints);
router.get('/complaints/recurring', adminController.getRecurringIssues);
router.patch('/complaints/:id/status', adminController.updateStatus);
router.patch('/complaints/:id/priority', adminController.updatePriority);
router.get('/dashboard', adminController.getDashboard);

module.exports = router;
