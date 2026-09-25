const express = require('express');
const {
  getHarvests,
  getHarvestById,
  createHarvest,
  updateHarvest,
  deleteHarvest,
} = require('../controllers/harvestController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getHarvests)
  .post(createHarvest);

router.route('/:id')
  .get(getHarvestById)
  .put(updateHarvest)
  .delete(deleteHarvest);

module.exports = router;
