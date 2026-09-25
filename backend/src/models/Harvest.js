const mongoose = require('mongoose');

const harvestSchema = new mongoose.Schema(
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
    fieldName: {
      type: String,
      required: [true, 'Field sector name is required'],
      trim: true,
    },
    harvestDate: {
      type: String,
      required: [true, 'Harvest date is required'],
    },
    predictedYieldTons: {
      type: Number,
      required: [true, 'Predicted yield in tons is required'],
      min: [0, 'Yield cannot be negative'],
    },
    actualYieldTons: {
      type: Number,
      required: [true, 'Actual yield in tons is required'],
      min: [0, 'Yield cannot be negative'],
    },
    differencePercent: {
      type: Number,
      default: 0,
    },
    qualityGrade: {
      type: String,
      enum: ['Grade A', 'Grade B', 'Grade C', 'Standard', 'Premium'],
      default: 'Grade A',
    },
    storageLocation: {
      type: String,
      trim: true,
      default: 'Central Warehouse',
    },
    revenue: {
      type: Number,
      min: [0, 'Revenue cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to compute yield difference percentage dynamically
harvestSchema.pre('save', function (next) {
  if (this.predictedYieldTons && this.predictedYieldTons > 0) {
    const diff = ((this.actualYieldTons - this.predictedYieldTons) / this.predictedYieldTons) * 100;
    this.differencePercent = Number(diff.toFixed(2));
  } else {
    this.differencePercent = 0;
  }
  next();
});

// Virtual for id mapping
harvestSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

harvestSchema.set('toJSON', { virtuals: true });
harvestSchema.set('toObject', { virtuals: true });

const Harvest = mongoose.model('Harvest', harvestSchema);

module.exports = Harvest;
