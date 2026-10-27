const feedbacks = require('../repositories/feedbackRepository');

async function submit(req, res, next) {
  try {
    const { candidateId, slotId, remarks, strengths, weaknesses, suggestions, rating } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: 'candidateId is required.' });
    }

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({ message: 'Evaluation remarks are required.' });
    }

    if (!strengths || !strengths.trim()) {
      return res.status(400).json({ message: 'Candidate strengths are required.' });
    }

    if (!weaknesses || !weaknesses.trim()) {
      return res.status(400).json({ message: 'Candidate weaknesses / areas for improvement are required.' });
    }

    if (!suggestions || !suggestions.trim()) {
      return res.status(400).json({ message: 'Actionable improvement suggestions are required.' });
    }

    const numericRating = rating !== undefined ? parseInt(rating, 10) : 5;
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    const created = await feedbacks.createFeedback({
      candidateId,
      adminId: req.user.id,
      slotId: slotId || null,
      remarks: remarks.trim(),
      strengths: strengths.trim(),
      weaknesses: weaknesses.trim(),
      suggestions: suggestions.trim(),
      rating: numericRating,
    });

    res.status(201).json({
      message: 'Interview evaluation & feedback recorded successfully (immutable).',
      feedback: created,
    });
  } catch (err) {
    next(err);
  }
}

async function myFeedback(req, res, next) {
  try {
    const candidateId = req.user.id;
    const history = await feedbacks.findFeedbackByCandidate(candidateId);
    res.json(history);
  } catch (err) {
    next(err);
  }
}

async function candidateHistory(req, res, next) {
  try {
    const { candidateId } = req.params;
    const isAdmin = ['SUPER_ADMIN', 'SYNDICATE_LEAD'].includes(req.user.role);

    // Candidates cannot peek at other candidates' feedback
    if (!isAdmin && candidateId !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied: You are not authorized to view another candidate’s feedback history.',
      });
    }

    const history = await feedbacks.findFeedbackByCandidate(candidateId);
    res.json(history);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submit,
  myFeedback,
  candidateHistory,
};
