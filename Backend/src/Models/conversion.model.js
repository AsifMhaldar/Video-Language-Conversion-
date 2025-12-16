const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  // Original video reference
  originalVideo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
  },
  
  // Original video URL (direct link)
  originalVideoUrl: {
    type: String,
    required: true
  },
  
  // Converted video details
  convertedVideoUrl: {
    type: String,
    default: null
  },
  
  convertedPublicId: {
    type: String,
    default: null
  },
  
  // Language information
  sourceLanguage: {
    type: String,
    required: true,
    default: 'detecting...'
  },
  
  targetLanguage: {
    type: String,
    required: true,
    index: true
  },
  
  // Conversion status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Progress tracking (0-100)
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Current step/message
  currentStep: {
    type: String,
    default: 'Queued'
  },
  
  // Transcription data
  transcription: {
    type: String,
    default: null
  },
  
  // Translated text
  translatedText: {
    type: String,
    default: null
  },
  
  // Audio URL (optional, if stored separately)
  audioUrl: {
    type: String,
    default: null
  },
  
  // Error message (if failed)
  error: {
    type: String,
    default: null
  },
  
  // Video duration in seconds
  duration: {
    type: Number,
    default: null
  },
  
  // Number of words transcribed
  wordsCount: {
    type: Number,
    default: 0
  },
  
  // Number of subtitle segments
  segmentsCount: {
    type: Number,
    default: 0
  },
  
  // Lip-sync feature
  enableLipsync: {
    type: Boolean,
    default: false
  },
  
  lipsyncApplied: {
    type: Boolean,
    default: false
  },
  
  // User who requested conversion
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  // Processing metadata
  startedAt: {
    type: Date,
    default: null
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  processingTime: {
    type: Number, // in seconds
    default: null
  }
}, {
  timestamps: true
});

// Indexes for faster queries
conversionSchema.index({ userId: 1, status: 1 });
conversionSchema.index({ status: 1, createdAt: -1 });
conversionSchema.index({ originalVideo: 1 });
conversionSchema.index({ createdAt: -1 });

// Virtual for calculating processing time
conversionSchema.virtual('processingTimeMinutes').get(function() {
  if (this.processingTime) {
    return Math.round(this.processingTime / 60);
  }
  return null;
});

// Pre-save middleware to update timestamps and calculate processing time
conversionSchema.pre('save', async function() {
  // Set startedAt when status changes to processing
  if (this.isModified('status') && this.status === 'processing' && !this.startedAt) {
    this.startedAt = new Date();
  }
  
  // Set completedAt and calculate processing time when completed or failed
  if (this.isModified('status') && 
      (this.status === 'completed' || this.status === 'failed') && 
      !this.completedAt) {
    this.completedAt = new Date();
    
    if (this.startedAt) {
      this.processingTime = Math.round((this.completedAt - this.startedAt) / 1000);
    }
  }
});

// Instance methods

/**
 * Check if conversion is in progress
 */
conversionSchema.methods.isInProgress = function() {
  return this.status === 'pending' || this.status === 'processing';
};

/**
 * Check if conversion is complete
 */
conversionSchema.methods.isComplete = function() {
  return this.status === 'completed';
};

/**
 * Check if conversion failed
 */
conversionSchema.methods.isFailed = function() {
  return this.status === 'failed';
};

/**
 * Get conversion summary
 */
conversionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    status: this.status,
    progress: this.progress,
    sourceLanguage: this.sourceLanguage,
    targetLanguage: this.targetLanguage,
    duration: this.duration,
    wordsCount: this.wordsCount,
    segmentsCount: this.segmentsCount,
    lipsyncApplied: this.lipsyncApplied,
    processingTime: this.processingTime,
    createdAt: this.createdAt,
    completedAt: this.completedAt
  };
};

// Static methods

/**
 * Get conversions by status
 */
conversionSchema.statics.getByStatus = function(status, limit = 10) {
  return this.find({ status })
    .populate('originalVideo', 'title thumbnail')
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Get user's recent conversions
 */
conversionSchema.statics.getUserRecent = function(userId, limit = 10) {
  return this.find({ userId })
    .populate('originalVideo', 'title thumbnail')
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Get conversion statistics
 */
conversionSchema.statics.getStats = async function(userId = null) {
  const match = userId ? { userId: mongoose.Types.ObjectId(userId) } : {};
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProcessingTime: { $avg: '$processingTime' },
        totalDuration: { $sum: '$duration' }
      }
    }
  ]);
  
  const result = {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    avgProcessingTime: 0,
    totalDuration: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
    
    if (stat._id === 'completed' && stat.avgProcessingTime) {
      result.avgProcessingTime = Math.round(stat.avgProcessingTime);
    }
    
    if (stat.totalDuration) {
      result.totalDuration += stat.totalDuration;
    }
  });
  
  return result;
};

/**
 * Clean up old failed conversions
 */
conversionSchema.statics.cleanupOldFailed = async function(daysOld = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const result = await this.deleteMany({
    status: 'failed',
    createdAt: { $lt: cutoffDate }
  });
  
  return result.deletedCount;
};

// Export model
module.exports = mongoose.model('Conversion', conversionSchema);