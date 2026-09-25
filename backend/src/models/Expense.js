const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['Seeds', 'Fertilizer', 'Labour', 'Fuel', 'Equipment', 'Pesticides', 'Other'],
      required: [true, 'Category is required'],
      default: 'Other',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    fieldName: {
      type: String,
      trim: true,
      default: 'General Farm',
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: 'Bank Transfer',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for id mapping
expenseSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

expenseSchema.set('toJSON', { virtuals: true });
expenseSchema.set('toObject', { virtuals: true });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
