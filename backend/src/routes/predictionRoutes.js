const express = require('express');
const {
  predictCrop,
  predictYield,
  predictFertilizer,
  detectDisease,
} = require('../controllers/predictionController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/crop', predictCrop);
router.post('/yield', predictYield);
router.post('/fertilizer', predictFertilizer);
router.post('/disease', detectDisease);

module.exports = router;
