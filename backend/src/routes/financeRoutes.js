const express = require('express');
const {
  getExpenses,
  createExpense,
  deleteExpense,
  getIncomes,
  createIncome,
  deleteIncome,
} = require('../controllers/financeController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/expenses')
  .get(getExpenses)
  .post(createExpense);

router.route('/expenses/:id')
  .delete(deleteExpense);

router.route('/income')
  .get(getIncomes)
  .post(createIncome);

router.route('/income/:id')
  .delete(deleteIncome);

module.exports = router;
