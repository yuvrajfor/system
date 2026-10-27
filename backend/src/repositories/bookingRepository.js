const prisma = require('../lib/prisma');

const defaultInclude = {
  candidate: { select: { id: true, name: true, email: true, role: true } },
  slot: {
    include: {
      admin: { select: { id: true, name: true, email: true, role: true } },
    },
  },
};

function findBookingById(id) {
  return prisma.booking.findUnique({
    where: { id },
    include: defaultInclude,
  });
}
function findBookingBySlotId(slotId) {
  return prisma.booking.findFirst({
    where: { slotId, status: 'CONFIRMED' },
    include: defaultInclude,
    orderBy: { createdAt: 'desc' },
  });
}

function findBookingsByCandidate(candidateId) {
  return prisma.booking.findMany({
    where: { candidateId },
    include: defaultInclude,
    orderBy: { createdAt: 'desc' },
  });
}

function findAllBookings() {
  return prisma.booking.findMany({
    include: defaultInclude,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Atomically books a slot.
 * Guarantees race-condition prevention and no double-booking.
 */
/**
 * Atomically books a slot without allowing double booking.
 */
async function bookSlotAtomic({ slotId, candidateId, notes }) {
  return prisma.$transaction(async (tx) => {
    const slot = await tx.interviewSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      const err = new Error('Interview slot not found.');
      err.statusCode = 404;
      throw err;
    }

    if (slot.status !== 'AVAILABLE') {
      const err = new Error(
        slot.status === 'BOOKED'
          ? 'This interview slot has already been booked by another candidate.'
          : 'This interview slot is no longer available.'
      );
      err.statusCode = 409;
      throw err;
    }

    if (slot.startTime <= new Date()) {
      const err = new Error('Past interview slots cannot be booked.');
      err.statusCode = 409;
      throw err;
    }

    const existingCandidateBooking = await tx.booking.findFirst({
      where: {
        slotId,
        candidateId,
        status: 'CONFIRMED',
      },
    });

    if (existingCandidateBooking) {
      const err = new Error(
        'You already have a confirmed booking for this slot.'
      );
      err.statusCode = 400;
      throw err;
    }

    // Claim the slot only if it is still available.
    const claim = await tx.interviewSlot.updateMany({
      where: {
        id: slotId,
        status: 'AVAILABLE',
        startTime: { gt: new Date() },
      },
      data: { status: 'BOOKED' },
    });

    if (claim.count !== 1) {
      const err = new Error(
        'This interview slot is no longer available. Please refresh and try again.'
      );
      err.statusCode = 409;
      throw err;
    }

    return tx.booking.create({
      data: {
        slotId,
        candidateId,
        notes: notes || null,
        status: 'CONFIRMED',
      },
      include: defaultInclude,
    });
  });
}

/**
 * Atomically cancels a booking and frees the slot.
 */
/**
 * Cancels a confirmed booking and frees its slot.
 * Preserves the booking record for history.
 */
async function cancelBookingAtomic(bookingId) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      const err = new Error('Booking not found.');
      err.statusCode = 404;
      throw err;
    }

    if (booking.status === 'CANCELLED') {
      const err = new Error('Booking is already cancelled.');
      err.statusCode = 400;
      throw err;
    }

    if (booking.status === 'COMPLETED') {
      const err = new Error('Completed bookings cannot be cancelled.');
      err.statusCode = 400;
      throw err;
    }

    // Cancel only if the booking is still confirmed.
    const cancellation = await tx.booking.updateMany({
      where: {
        id: bookingId,
        status: 'CONFIRMED',
      },
      data: { status: 'CANCELLED' },
    });

    if (cancellation.count !== 1) {
      const err = new Error(
        'This booking has changed. Refresh and try again.'
      );
      err.statusCode = 409;
      throw err;
    }

    // Reopen only a slot that is currently booked.
    const reopenedSlot = await tx.interviewSlot.updateMany({
      where: {
        id: booking.slotId,
        status: 'BOOKED',
      },
      data: { status: 'AVAILABLE' },
    });

    if (reopenedSlot.count !== 1) {
      const err = new Error(
        'The slot could not be reopened. Please contact the administrator.'
      );
      err.statusCode = 409;
      throw err;
    }

    return tx.booking.findUnique({
      where: { id: bookingId },
      include: defaultInclude,
    });
  });
}

module.exports = {
  findBookingById,
  findBookingBySlotId,
  findBookingsByCandidate,
  findAllBookings,
  bookSlotAtomic,
  cancelBookingAtomic,
};
