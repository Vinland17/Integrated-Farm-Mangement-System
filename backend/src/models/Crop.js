const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm reference is required']
    },
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Field',
      required: [true, 'Field reference is required']
    },
    name: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true
    },
    variety: {
      type: String,
      default: '',
      trim: true
    },
    sowingDate: {
      type: String,
      default: ''
    },
    expectedHarvest: {
      type: String,
      default: ''
    },
    stage: {
      type: String,
      default: 'Vegetative',
      trim: true
    },
    healthStatus: {
      type: String,
      default: 'Healthy',
      trim: true
    },
    estimatedYieldTons: {
      type: Number,
      default: 0,
      min: [0, 'Yield cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

// Virtual for id mapping
cropSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

cropSchema.set('toJSON', { virtuals: true });
cropSchema.set('toObject', { virtuals: true });

const Crop = mongoose.model('Crop', cropSchema);

module.exports = Crop;
