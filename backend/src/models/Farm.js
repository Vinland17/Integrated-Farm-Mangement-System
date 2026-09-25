const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true
    },
    location: {
      type: String,
      default: '',
      trim: true
    },
    totalArea: {
      type: Number,
      default: 0,
      min: [0, 'Total area cannot be negative']
    },
    fieldCount: {
      type: Number,
      default: 0
    },
    activeCrops: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    lat: {
      type: Number,
      default: 12.9716
    },
    lng: {
      type: Number,
      default: 77.5946
    },
    status: {
      type: String,
      enum: ['Active', 'Under Maintenance', 'Inactive'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

// Virtual for id mapping
farmSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

farmSchema.set('toJSON', { virtuals: true });
farmSchema.set('toObject', { virtuals: true });

const Farm = mongoose.model('Farm', farmSchema);

module.exports = Farm;
