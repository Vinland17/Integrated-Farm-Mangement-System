const mongoose = require('mongoose');

const soilRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Field',
      required: [true, 'Field reference is required']
    },
    date: {
      type: Date,
      required: [true, 'Sample date is required'],
      default: Date.now
    },
    nitrogen: {
      type: Number,
      required: [true, 'Nitrogen (N) level is required'],
      min: [0, 'Nitrogen level cannot be negative']
    },
    phosphorus: {
      type: Number,
      required: [true, 'Phosphorus (P) level is required'],
      min: [0, 'Phosphorus level cannot be negative']
    },
    potassium: {
      type: Number,
      required: [true, 'Potassium (K) level is required'],
      min: [0, 'Potassium level cannot be negative']
    },
    pH: {
      type: Number,
      required: [true, 'Soil pH level is required'],
      min: [0, 'pH level cannot be less than 0'],
      max: [14, 'pH level cannot exceed 14']
    },
    moisture: {
      type: Number,
      required: [true, 'Soil moisture percentage is required'],
      min: [0, 'Moisture cannot be negative'],
      max: [100, 'Moisture percentage cannot exceed 100']
    },
    organicMatter: {
      type: Number,
      required: [true, 'Organic Matter percentage is required'],
      min: [0, 'Organic Matter percentage cannot be negative']
    },
    healthScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual for id mapping
soilRecordSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

soilRecordSchema.set('toJSON', { virtuals: true });
soilRecordSchema.set('toObject', { virtuals: true });

const SoilRecord = mongoose.model('SoilRecord', soilRecordSchema);

module.exports = SoilRecord;
