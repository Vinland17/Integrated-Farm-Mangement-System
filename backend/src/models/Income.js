const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    buyer: {
      type: String,
      required: [true, 'Buyer name is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Income amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    quantityTons: {
      type: Number,
      required: [true, 'Quantity in tons is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    invoiceNumber: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for id mapping
incomeSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

incomeSchema.set('toJSON', { virtuals: true });
incomeSchema.set('toObject', { virtuals: true });

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;
