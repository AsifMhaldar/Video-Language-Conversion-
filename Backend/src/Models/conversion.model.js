// models/conversion.js
const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversionId: {
    type: String,
    required: true,
    unique: true
  },
  sourceLanguage: String,
  targetLanguage: {
    type: String,
    required: true
  },
  enableLipsync: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'cancelled'],
    default: 'processing'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  currentStep: String,
  cloudinaryUrl: String,
  publicId: String,
  originalVideoUrl: String,
  originalVideoTitle: String,
  transcription: String,
  translation: String,
  duration: Number,
  fileSize: Number,
  error: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  failedAt: Date
});

conversionSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

const Conversion = mongoose.model('Conversion', conversionSchema);
module.exports = Conversion;