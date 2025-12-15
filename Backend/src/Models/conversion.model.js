const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  originalVideo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  originalVideoUrl: {
    type: String,
    required: true
  },
  convertedVideoUrl: {
    type: String
  },
  convertedPublicId: {
    type: String
  },
  sourceLanguage: {
    type: String,
    required: true
  },
  targetLanguage: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  transcription: {
    type: String
  },
  translatedText: {
    type: String
  },
  audioUrl: {
    type: String
  },
  error: {
    type: String
  },
  duration: {
    type: Number
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
conversionSchema.index({ userId: 1, status: 1 });
conversionSchema.index({ originalVideo: 1 });

module.exports = mongoose.model('Conversion', conversionSchema);