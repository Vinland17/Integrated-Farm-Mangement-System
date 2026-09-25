const express = require('express');
const {
  getWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
} = require('../controllers/workerController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all worker routes with JWT middleware
router.use(protect);

router.route('/')
  .get(getWorkers)
  .post(createWorker);

router.route('/:id')
  .get(getWorkerById)
  .put(updateWorker)
  .delete(deleteWorker);

module.exports = router;
