const bookings = require('../repositories/bookingRepository');

async function book(req, res, next) {
  try {
    const { slotId, notes } = req.body;

    if (!slotId) {
      return res.status(400).json({ message: 'slotId is required to book an interview.' });
    }

    const candidateId = req.user.id;

    const result = await bookings.bookSlotAtomic({
      slotId,
      candidateId,
      notes: notes ? notes.trim() : null,
    });

    res.status(201).json({
      message: 'Interview slot successfully booked!',
      booking: result,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await bookings.findBookingById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking record not found.' });
    }

    // Candidate can only cancel their own booking. Super admin / syndicate lead can cancel any.
    const isAdmin = ['SUPER_ADMIN', 'SYNDICATE_LEAD'].includes(req.user.role);
    if (!isAdmin && booking.candidateId !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied: You cannot cancel another candidate’s booking.',
      });
    }

    const cancelled = await bookings.cancelBookingAtomic(id);
    res.json({
      message: 'Booking cancelled successfully. Slot is reopened.',
      booking: cancelled,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
}

async function myBookings(req, res, next) {
  try {
    const candidateId = req.user.id;
    const list = await bookings.findBookingsByCandidate(candidateId);
    res.json(list);
  } catch (err) {
    next(err);
  }
}

async function listAll(req, res, next) {
  try {
    const list = await bookings.findAllBookings();
    res.json(list);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  book,
  cancel,
  myBookings,
  listAll,
};
