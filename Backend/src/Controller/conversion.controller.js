const Conversion = require('../Models/conversion.model');
const Video = require('../Models/video');
const { executePythonConverter } = require('../Utils/pythonExecutor');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

/**
 * Start video conversion with auto language detection
 */
const startConversion = async (req, res) => {
  try {
    const { videoId, targetLanguage, enableLipsync = false } = req.body;

    // Validate input
    if (!videoId || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Video ID and target language are required'
      });
    }

    // Validate target language
    const { SUPPORTED_LANGUAGES } = require('../utils/language.utils');
    if (!SUPPORTED_LANGUAGES[targetLanguage]) {
      return res.status(400).json({
        success: false,
        message: `Unsupported target language: ${targetLanguage}`,
        supportedLanguages: Object.keys(SUPPORTED_LANGUAGES)
      });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Create conversion record with auto-detection
    const conversion = await Conversion.create({
      originalVideo: videoId,
      originalVideoUrl: video.videoUrl,
      sourceLanguage: 'detecting...', // Will be auto-detected
      targetLanguage,
      status: 'pending',
      progress: 0,
      enableLipsync: enableLipsync || false,
      userId: req.user?._id
    });

    // Start async processing
    processConversion(conversion._id).catch(err => {
      console.error('Async conversion error:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Conversion started. Language will be auto-detected.',
      data: {
        conversionId: conversion._id,
        status: conversion.status,
        progress: conversion.progress,
        targetLanguage: conversion.targetLanguage,
        enableLipsync: conversion.enableLipsync
      }
    });
  } catch (error) {
    console.error('Start conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start conversion',
      error: error.message
    });
  }
};

/**
 * Process conversion asynchronously
 */
const processConversion = async (conversionId) => {
  let conversion;
  let tempFiles = [];
  
  try {
    conversion = await Conversion.findById(conversionId).populate('originalVideo');
    
    if (!conversion) {
      throw new Error('Conversion not found');
    }

    // Update status to processing
    conversion.status = 'processing';
    conversion.progress = 5;
    await conversion.save();

    console.log(`[Conversion ${conversionId}] Starting Python conversion...`);

    // Prepare output directory
    const outputDir = path.join(__dirname, '../../converted_videos');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, `converted_${conversionId}.mp4`);

    // Progress callback for real-time updates
    const progressCallback = async (progress, message) => {
      console.log(`[Conversion ${conversionId}] [${progress}%] ${message}`);
      
      if (progress >= 0 && progress <= 100) {
        try {
          conversion.progress = progress;
          conversion.currentStep = message;
          await conversion.save();
        } catch (saveError) {
          console.error('Failed to save progress:', saveError);
        }
      }
    };

    // Execute Python converter with auto-detection
    const result = await executePythonConverter(
      conversion.originalVideoUrl,
      conversion.targetLanguage,
      outputPath,
      progressCallback,
      conversion.enableLipsync
    );

    if (!result.success) {
      throw new Error(result.error || 'Conversion failed');
    }

    // Update with detected language and results
    conversion.sourceLanguage = result.detected_language;
    conversion.transcription = result.transcription;
    conversion.translatedText = result.translation;
    conversion.duration = result.duration;
    conversion.wordsCount = result.words_count;
    conversion.segmentsCount = result.segments_count;
    conversion.lipsyncApplied = result.lipsync_applied || false;
    conversion.progress = 95;
    conversion.currentStep = 'Uploading to cloud...';
    await conversion.save();

    console.log(`[Conversion ${conversionId}] Uploading to Cloudinary...`);

    // Upload converted video to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(result.output_path, {
      resource_type: 'video',
      folder: 'converted_videos',
      public_id: `converted_${conversionId}`,
      chunk_size: 6000000, // 6MB chunks for large files
      timeout: 300000 // 5 minute timeout
    });

    conversion.convertedVideoUrl = cloudinaryResult.secure_url;
    conversion.convertedPublicId = cloudinaryResult.public_id;
    conversion.status = 'completed';
    conversion.progress = 100;
    conversion.currentStep = 'Completed';
    await conversion.save();

    // Clean up local file
    if (fs.existsSync(result.output_path)) {
      fs.unlinkSync(result.output_path);
      console.log(`[Conversion ${conversionId}] Cleaned up local file`);
    }

    console.log(`[Conversion ${conversionId}] ✅ Conversion completed successfully`);

    // Log summary
    console.log(`
      ========================================
      Conversion Summary (${conversionId})
      ========================================
      Source Language: ${conversion.sourceLanguage}
      Target Language: ${conversion.targetLanguage}
      Duration: ${conversion.duration}s
      Words: ${conversion.wordsCount}
      Segments: ${conversion.segmentsCount}
      Lip-sync: ${conversion.lipsyncApplied ? 'Yes' : 'No'}
      Output: ${conversion.convertedVideoUrl}
      ========================================
    `);

  } catch (error) {
    console.error(`[Conversion ${conversionId}] ❌ Error:`, error);
    
    // Update conversion status to failed
    try {
      if (conversion) {
        conversion.status = 'failed';
        conversion.error = error.message;
        conversion.currentStep = 'Failed';
        await conversion.save();
      }
    } catch (updateError) {
      console.error('Failed to update conversion status:', updateError);
    }

    // Clean up any temporary files
    if (tempFiles.length > 0) {
      tempFiles.forEach(file => {
        try {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      });
    }
  }
};

/**
 * Get conversion status by ID
 */
const getConversionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const conversion = await Conversion.findById(id)
      .populate('originalVideo', 'title thumbnail videoUrl duration')
      .populate('userId', 'name email');

    if (!conversion) {
      return res.status(404).json({
        success: false,
        message: 'Conversion not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: conversion._id,
        status: conversion.status,
        progress: conversion.progress,
        currentStep: conversion.currentStep,
        sourceLanguage: conversion.sourceLanguage,
        targetLanguage: conversion.targetLanguage,
        originalVideo: conversion.originalVideo,
        convertedVideoUrl: conversion.convertedVideoUrl,
        transcription: conversion.transcription,
        translatedText: conversion.translatedText,
        duration: conversion.duration,
        wordsCount: conversion.wordsCount,
        segmentsCount: conversion.segmentsCount,
        lipsyncApplied: conversion.lipsyncApplied,
        error: conversion.error,
        createdAt: conversion.createdAt,
        updatedAt: conversion.updatedAt
      }
    });
  } catch (error) {
    console.error('Get conversion status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversion status',
      error: error.message
    });
  }
};

/**
 * Get all conversions for logged-in user
 */
const getAllConversions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { userId: req.user?._id };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversions = await Conversion.find(filter)
      .populate('originalVideo', 'title thumbnail duration')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Conversion.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: conversions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all conversions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversions',
      error: error.message
    });
  }
};

/**
 * Get all conversions (admin only)
 */
const getAllConversionsAdmin = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filter = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversions = await Conversion.find(filter)
      .populate('originalVideo', 'title thumbnail')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Conversion.countDocuments(filter);

    // Get statistics
    const stats = await Conversion.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: conversions,
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all conversions admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversions',
      error: error.message
    });
  }
};

/**
 * Delete conversion
 */
const deleteConversion = async (req, res) => {
  try {
    const { id } = req.params;

    const conversion = await Conversion.findById(id);

    if (!conversion) {
      return res.status(404).json({
        success: false,
        message: 'Conversion not found'
      });
    }

    // Check ownership (if not admin)
    if (req.user && conversion.userId && 
        conversion.userId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete converted video from Cloudinary
    if (conversion.convertedPublicId) {
      try {
        await cloudinary.uploader.destroy(conversion.convertedPublicId, {
          resource_type: 'video'
        });
        console.log(`Deleted video from Cloudinary: ${conversion.convertedPublicId}`);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
      }
    }

    await Conversion.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Conversion deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversion',
      error: error.message
    });
  }
};

/**
 * Retry failed conversion
 */
const retryConversion = async (req, res) => {
  try {
    const { id } = req.params;

    const conversion = await Conversion.findById(id);

    if (!conversion) {
      return res.status(404).json({
        success: false,
        message: 'Conversion not found'
      });
    }

    // Check ownership
    if (req.user && conversion.userId && 
        conversion.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (conversion.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Only failed conversions can be retried'
      });
    }

    // Reset conversion
    conversion.status = 'pending';
    conversion.progress = 0;
    conversion.error = null;
    conversion.currentStep = 'Queued for retry';
    conversion.convertedVideoUrl = null;
    conversion.convertedPublicId = null;
    await conversion.save();

    // Start processing
    processConversion(conversion._id).catch(err => {
      console.error('Retry conversion error:', err);
    });

    res.status(200).json({
      success: true,
      message: 'Conversion retry started',
      data: conversion
    });
  } catch (error) {
    console.error('Retry conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retry conversion',
      error: error.message
    });
  }
};

/**
 * Cancel ongoing conversion
 */
const cancelConversion = async (req, res) => {
  try {
    const { id } = req.params;

    const conversion = await Conversion.findById(id);

    if (!conversion) {
      return res.status(404).json({
        success: false,
        message: 'Conversion not found'
      });
    }

    // Check ownership
    if (req.user && conversion.userId && 
        conversion.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (conversion.status !== 'pending' && conversion.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: 'Only pending or processing conversions can be cancelled'
      });
    }

    conversion.status = 'cancelled';
    conversion.error = 'Cancelled by user';
    conversion.currentStep = 'Cancelled';
    await conversion.save();

    res.status(200).json({
      success: true,
      message: 'Conversion cancelled successfully',
      data: conversion
    });
  } catch (error) {
    console.error('Cancel conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel conversion',
      error: error.message
    });
  }
};

module.exports = {
  startConversion,
  getConversionStatus,
  getAllConversions,
  getAllConversionsAdmin,
  deleteConversion,
  retryConversion,
  cancelConversion
};