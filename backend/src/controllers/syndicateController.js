const syndicates = require('../repositories/syndicateRepository');

async function list(req, res, next) {
  try {
    const list = await syndicates.findAll();
    res.json(list);
  } catch (error) {
    next(error);
  }
}

async function getOne(req, res, next) {
  try {
    const item = await syndicates.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Syndicate not found.' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const { name, description, resourcesAllocated } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required.' });
    }
    const created = await syndicates.create({
      name: name.trim(),
      description: description.trim(),
      resourcesAllocated: Number(resourcesAllocated) || 0,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { name, description, resourcesAllocated } = req.body;
    const data = {};
    if (name) data.name = name.trim();
    if (description) data.description = description.trim();
    if (resourcesAllocated !== undefined) {
      data.resourcesAllocated = Number(resourcesAllocated) || 0;
    }

    const updated = await syndicates.update(req.params.id, data);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await syndicates.remove(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove
};
