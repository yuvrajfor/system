const slots = require('../repositories/slotRepository');

async function listAvailable(req, res, next) {
  try {
    const available = await slots.findAvailableSlots();
    res.json(available);
  } catch (err) {
    next(err);
  }
}

async function listAll(req, res, next) {
  try {
    const { status, futureOnly } = req.query;
    const allSlots = await slots.findAllSlots({
      status: status || undefined,
      futureOnly: futureOnly === 'true',
    });
    res.json(allSlots);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { title, startTime, endTime } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Interview title or topic is required.' });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'Both start time and end time are required.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date/time format provided.' });
    }

    if (start >= end) {
      return res.status(400).json({ message: 'Start time must be strictly earlier than end time.' });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: 'Interview slot start time cannot be in the past.' });
    }

    const slot = await slots.createSlot({
      adminId: req.user.id,
      title: title.trim(),
      startTime: start,
      endTime: end,
      status: 'AVAILABLE',
    });

    res.status(201).json(slot);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await slots.findSlotById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Interview slot not found.' });
    }

    const { title, startTime, endTime, status } = req.body;
    const data = {};

    if (title && title.trim()) data.title = title.trim();
    if (status && ['AVAILABLE', 'BOOKED', 'CANCELLED'].includes(status)) {
      data.status = status;
    }

    if (startTime) {
      const start = new Date(startTime);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ message: 'Invalid start time.' });
      }
      data.startTime = start;
    }

    if (endTime) {
      const end = new Date(endTime);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid end time.' });
      }
      data.endTime = end;
    }

    const effectiveStart = data.startTime || existing.startTime;
    const effectiveEnd = data.endTime || existing.endTime;

    if (effectiveStart >= effectiveEnd) {
      return res.status(400).json({ message: 'Start time must precede end time.' });
    }

    const updated = await slots.updateSlot(id, data);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await slots.findSlotById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Interview slot not found.' });
    }

    const updated = await slots.updateSlot(id, { status: 'CANCELLED' });
    res.json({ message: 'Interview slot marked as cancelled.', slot: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAvailable,
  listAll,
  create,
  update,
  cancel,
};
