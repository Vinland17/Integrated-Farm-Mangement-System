const express = require('express');
const {
  getSoilRecords,
  getSoilRecordById,
  createSoilRecord,
  updateSoilRecord,
  deleteSoilRecord
} = require('../controllers/soilController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSoilRecords)
  .post(createSoilRecord);

router.route('/:id')
  .get(getSoilRecordById)
  .put(updateSoilRecord)
  .delete(deleteSoilRecord);

module.exports = router;
