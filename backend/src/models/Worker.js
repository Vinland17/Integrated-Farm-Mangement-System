const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Worker name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role title is required'],
      trim: true,
      default: 'Field Technician',
    },
    assignedField: {
      type: String,
      trim: true,
      default: 'Unassigned',
    },
    currentTask: {
      type: String,
      trim: true,
      default: 'General Maintenance',
    },
    hoursLogged: {
      type: Number,
      min: [0, 'Hours logged cannot be negative'],
      default: 0,
    },
    status: {
      type: String,
      enum: ['Available', 'Working', 'On Leave'],
      default: 'Available',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for id mapping
workerSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

workerSchema.set('toJSON', { virtuals: true });
workerSchema.set('toObject', { virtuals: true });

const Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;
