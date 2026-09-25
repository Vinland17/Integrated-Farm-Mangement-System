const Expense = require('../models/Expense');
const Income = require('../models/Income');

const formatResponse = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
  };
};

/**
 * @desc    Get expenses for authenticated user
 * @route   GET /api/finance/expenses
 * @access  Private
 */
const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(expenses.map(formatResponse));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new expense entry
 * @route   POST /api/finance/expenses
 * @access  Private
 */
const createExpense = async (req, res, next) => {
  try {
    const { category, description, amount, date, fieldName, paymentMethod } = req.body;

    if (!description || amount === undefined) {
      return res.status(400).json({ message: 'Description and amount are required' });
    }

    const newExpense = new Expense({
      user: req.user._id,
      category: category || 'Other',
      description,
      amount: Number(amount) || 0,
      date: date || new Date().toISOString().split('T')[0],
      fieldName: fieldName || 'General Farm',
      paymentMethod: paymentMethod || 'Bank Transfer',
    });

    const saved = await newExpense.save();
    res.status(201).json(formatResponse(saved));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an expense entry
 * @route   DELETE /api/finance/expenses/:id
 * @access  Private
 */
const deleteExpense = async (req, res, next) => {
  try {
    const deleted = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) {
      return res.status(404).json({ message: 'Expense record not found or unauthorized' });
    }
    res.status(200).json({ message: 'Expense deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get income entries for authenticated user
 * @route   GET /api/finance/income
 * @access  Private
 */
const getIncomes = async (req, res, next) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(incomes.map(formatResponse));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new income entry
 * @route   POST /api/finance/income
 * @access  Private
 */
const createIncome = async (req, res, next) => {
  try {
    const { cropName, buyer, amount, quantityTons, date, invoiceNumber } = req.body;

    if (!cropName || !buyer || amount === undefined) {
      return res.status(400).json({ message: 'Crop name, buyer, and amount are required' });
    }

    const newIncome = new Income({
      user: req.user._id,
      cropName,
      buyer,
      amount: Number(amount) || 0,
      quantityTons: Number(quantityTons) || 0,
      date: date || new Date().toISOString().split('T')[0],
      invoiceNumber: invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
    });

    const saved = await newIncome.save();
    res.status(201).json(formatResponse(saved));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an income entry
 * @route   DELETE /api/finance/income/:id
 * @access  Private
 */
const deleteIncome = async (req, res, next) => {
  try {
    const deleted = await Income.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) {
      return res.status(404).json({ message: 'Income record not found or unauthorized' });
    }
    res.status(200).json({ message: 'Income entry deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense,
  getIncomes,
  createIncome,
  deleteIncome,
};
