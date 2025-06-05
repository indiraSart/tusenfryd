const Reservation = require('../models/reservation');
const Attraction = require('../models/attraction');

// Get all reservations (admin only)
exports.getAll = async (req, res, next) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'name email')
      .populate('attraction');
    res.json(reservations);
  } catch (err) {
    next(err);
  }
};

// Get user's reservations
exports.getUserReservations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reservations = await Reservation.find({ user: userId })
      .populate('attraction')
      .sort({ date: 1, time: 1 });
    res.json(reservations);
  } catch (err) {
    next(err);
  }
};

// Create a new reservation
exports.create = async (req, res, next) => {
  try {
    const { attractionId, time } = req.body;
    const userId = req.user.id;

    // Validate attraction exists
    const attraction = await Attraction.findById(attractionId);
    if (!attraction) {
      return res.status(404).json({ message: 'Attraction not found' });
    }

    // Check if attraction is open
    if (!attraction.isOpen) {
      return res.status(400).json({ message: 'Cannot reserve for closed attractions' });
    }

    // Create reservation
    const newReservation = new Reservation({
      user: userId,
      attraction: attractionId,
      time,
      date: new Date(),
      status: 'confirmed'
    });

    const savedReservation = await newReservation.save();
    res.status(201).json(savedReservation);
  } catch (err) {
    next(err);
  }
};

// Cancel a reservation
exports.cancel = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Check if user owns this reservation
    if (reservation.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    reservation.status = 'cancelled';
    await reservation.save();
    
    res.json({ message: 'Reservation cancelled' });
  } catch (err) {
    next(err);
  }
};
