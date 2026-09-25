const express = require('express');
const {
  getFields,
  getFieldById,
  createField,
  updateField,
  deleteField
} = require('../controllers/fieldController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getFields)
  .post(createField);

router.route('/:id')
  .get(getFieldById)
  .put(updateField)
  .delete(deleteField);

module.exports = router;
