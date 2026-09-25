const Worker = require('../models/Worker');

/**
 * Helper function to format worker response object for frontend
 */
const formatWorkerResponse = (worker) => {
  const workerObj = worker.toObject ? worker.toObject() : worker;
  return {
    ...workerObj,
    id: workerObj._id ? workerObj._id.toString() : workerObj.id,
  };
};

/**
 * @desc    Get all workers for logged-in user
 * @route   GET /api/workers
 * @access  Private
 */
const getWorkers = async (req, res, next) => {
  try {
    const workers = await Worker.find({ user: req.user._id }).sort({ createdAt: -1 });
    const formatted = workers.map(formatWorkerResponse);
    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single worker by ID
 * @route   GET /api/workers/:id
 * @access  Private
 */
const getWorkerById = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ _id: req.params.id, user: req.user._id });
    if (!worker) {
      return res.status(404).json({ message: 'Worker record not found' });
    }
    res.status(200).json(formatWorkerResponse(worker));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new worker record
 * @route   POST /api/workers
 * @access  Private
 */
const createWorker = async (req, res, next) => {
  try {
    const { name, role, assignedField, currentTask, hoursLogged, status, phone, email, avatar } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Worker name is required' });
    }

    const newWorker = new Worker({
      user: req.user._id,
      name,
      role: role || 'Field Technician',
      assignedField: assignedField || 'Unassigned',
      currentTask: currentTask || 'General Maintenance',
      hoursLogged: hoursLogged !== undefined ? Number(hoursLogged) : 0,
      status: status || 'Available',
      phone: phone || '',
      email: email || '',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    });

    const savedWorker = await newWorker.save();
    res.status(201).json(formatWorkerResponse(savedWorker));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a worker record
 * @route   PUT /api/workers/:id
 * @access  Private
 */
const updateWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ _id: req.params.id, user: req.user._id });

    if (!worker) {
      return res.status(404).json({ message: 'Worker record not found' });
    }

    const { name, role, assignedField, currentTask, hoursLogged, status, phone, email, avatar } = req.body;

    if (name !== undefined) worker.name = name;
    if (role !== undefined) worker.role = role;
    if (assignedField !== undefined) worker.assignedField = assignedField;
    if (currentTask !== undefined) worker.currentTask = currentTask;
    if (hoursLogged !== undefined) worker.hoursLogged = Number(hoursLogged);
    if (status !== undefined) worker.status = status;
    if (phone !== undefined) worker.phone = phone;
    if (email !== undefined) worker.email = email;
    if (avatar !== undefined) worker.avatar = avatar;

    const updatedWorker = await worker.save();
    res.status(200).json(formatWorkerResponse(updatedWorker));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a worker record
 * @route   DELETE /api/workers/:id
 * @access  Private
 */
const deleteWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!worker) {
      return res.status(404).json({ message: 'Worker record not found or unauthorized' });
    }

    res.status(200).json({ message: 'Worker removed successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
};
