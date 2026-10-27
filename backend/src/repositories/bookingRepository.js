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
  return prisma.booking.findUnique({
    where: { slotId },
    include: defaultInclude,
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
async function bookSlotAtomic({ slotId, candidateId, notes }) {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch the slot inside the transaction
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
      err.statusCode = 409; // Conflict
      throw err;
    }

    // 2. Check if candidate already has an active booking for this exact slot
    const existingCandidateBooking = await tx.booking.findFirst({
      where: {
        slotId,
        candidateId,
        status: 'CONFIRMED',
      },
    });

    if (existingCandidateBooking) {
      const err = new Error('You already have a confirmed booking for this slot.');
      err.statusCode = 400;
      throw err;
    }

    // 3. Create the booking
    const booking = await tx.booking.create({
      data: {
        slotId,
        candidateId,
        notes: notes || null,
        status: 'CONFIRMED',
      },
      include: defaultInclude,
    });

    // 4. Update the slot status to BOOKED
    await tx.interviewSlot.update({
      where: { id: slotId },
      data: { status: 'BOOKED' },
    });

    return booking;
  });
}

/**
 * Atomically cancels a booking and frees the slot.
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

    // 1. Set booking status to CANCELLED
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
      include: defaultInclude,
    });

    // 2. Re-open slot as AVAILABLE
    await tx.interviewSlot.update({
      where: { id: booking.slotId },
      data: { status: 'AVAILABLE' },
    });

    return updatedBooking;
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
