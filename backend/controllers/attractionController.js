const Attraction = require('../models/attraction');

// GET all attractions
exports.getAll = async (req, res, next) => {
  try {
    const data = await Attraction.find();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// POST create attraction
exports.create = async (req, res, next) => {
  try {
    const newAttraction = new Attraction(req.body);
    const saved = await newAttraction.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

// PUT update attraction
exports.update = async (req, res, next) => {
  try {
    const updated = await Attraction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE attraction
exports.delete = async (req, res, next) => {
  try {
    const deleted = await Attraction.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
