const tasks = require('../repositories/taskRepository');

async function create(req, res, next) {
  try {
    const { candidateId, slotId, title, description, dueDate } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: 'candidateId is required.' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    let parsedDueDate = null;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({ message: 'Invalid dueDate format.' });
      }
    }

    const task = await tasks.createTask({
      candidateId,
      adminId: req.user.id,
      slotId: slotId || null,
      title: title.trim(),
      description: description ? description.trim() : null,
      dueDate: parsedDueDate,
      status: 'PENDING',
    });

    res.status(201).json({
      message: 'Improvement task assigned to candidate.',
      task,
    });
  } catch (err) {
    next(err);
  }
}

async function myTasks(req, res, next) {
  try {
    const candidateId = req.user.id;
    const list = await tasks.findTasksByCandidate(candidateId);
    res.json(list);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be one of: PENDING, IN_PROGRESS, COMPLETED',
      });
    }

    const task = await tasks.findTaskById(id);
    if (!task) {
      return res.status(404).json({ message: 'Improvement task not found.' });
    }

    const isAdmin = ['SUPER_ADMIN', 'SYNDICATE_LEAD'].includes(req.user.role);
    if (!isAdmin && task.candidateId !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied: You cannot modify another candidate’s task.',
      });
    }

    const updated = await tasks.updateTaskStatus(id, status);
    res.json({
      message: 'Task status updated.',
      task: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function candidateTasks(req, res, next) {
  try {
    const { candidateId } = req.params;
    const isAdmin = ['SUPER_ADMIN', 'SYNDICATE_LEAD'].includes(req.user.role);

    if (!isAdmin && candidateId !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied: You cannot view another candidate’s tasks.',
      });
    }

    const list = await tasks.findTasksByCandidate(candidateId);
    res.json(list);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  myTasks,
  updateStatus,
  candidateTasks,
};
