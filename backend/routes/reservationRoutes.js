const express = require('express');
const router = express.Router();
const controller = require('../controllers/reservationController');
const { protect, admin } = require('../middleware/auth');

// Protected routes (require login)
router.get('/user', protect, controller.getUserReservations);
router.post('/', protect, controller.create);
router.post('/:id/cancel', protect, controller.cancel);

// Admin routes
router.get('/', protect, admin, controller.getAll);

module.exports = router;
