const Conversion = require('../Models/conversion.model');
const Video = require('../Models/video');
const { validateLanguages } = require('../utils/language.utils');
const { executePythonConverter } = require('../Utils/pythonExecutor');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Start video conversion
const startConversion = async (req, res) => {
  try {
    const { videoId, targetLanguage } = req.body;

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
        message: `Unsupported target language: ${targetLanguage}`
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

    // Create conversion record (sourceLanguage will be detected)
    const conversion = await Conversion.create({
      originalVideo: videoId,
      originalVideoUrl: video.videoUrl,
      sourceLanguage: 'auto', // Will be detected by Python
      targetLanguage,
      status: 'pending',
      userId: req.user?._id
    });

    // Start async processing
    processConversion(conversion._id);

    res.status(201).json({
      success: true,
      message: 'Conversion started successfully. Language will be auto-detected.',
      data: conversion
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

// Process conversion (async function)
const processConversion = async (conversionId) => {
  try {
    const conversion = await Conversion.findById(conversionId).populate('originalVideo');
    
    if (!conversion) {
      throw new Error('Conversion not found');
    }

    // Update status to processing
    conversion.status = 'processing';
    conversion.progress = 5;
    await conversion.save();

    console.log('Starting Python conversion process...');

    // Prepare output path
    const outputDir = path.join(__dirname, '../../converted_videos');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, `converted_${conversionId}.mp4`);

    // Progress callback
    const progressCallback = async (progress, message) => {
      console.log(`[${progress}%] ${message}`);
      
      if (progress >= 0) {
        conversion.progress = progress;
        await conversion.save();
      }
    };

    // Execute Python converter (no source language needed - auto-detect!)
    const result = await executePythonConverter(
      conversion.originalVideoUrl,
      conversion.targetLanguage,
      outputPath,
      progressCallback
    );

    if (!result.success) {
      throw new Error(result.error || 'Conversion failed');
    }

    // Update with detected language
    conversion.sourceLanguage = result.detected_language;
    conversion.transcription = result.transcription;
    conversion.translatedText = result.translation;
    conversion.progress = 95;
    await conversion.save();

    // Upload converted video to Cloudinary
    console.log('Uploading converted video to Cloudinary...');
    const cloudinaryResult = await cloudinary.uploader.upload(result.output_path, {
      resource_type: 'video',
      folder: 'converted_videos',
      public_id: `converted_${conversionId}`
    });

    conversion.convertedVideoUrl = cloudinaryResult.secure_url;
    conversion.convertedPublicId = cloudinaryResult.public_id;
    conversion.status = 'completed';
    conversion.progress = 100;
    await conversion.save();

    // Clean up local file
    if (fs.existsSync(result.output_path)) {
      fs.unlinkSync(result.output_path);
    }

    console.log('Conversion completed successfully:', conversionId);
  } catch (error) {
    console.error('Process conversion error:', error);
    
    try {
      await Conversion.findByIdAndUpdate(conversionId, {
        status: 'failed',
        error: error.message
      });
    } catch (updateError) {
      console.error('Failed to update conversion status:', updateError);
    }
  }
};

// Get conversion status
const getConversionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const conversion = await Conversion.findById(id)
      .populate('originalVideo', 'title thumbnail');

    if (!conversion) {
      return res.status(404).json({
        success: false,
        message: 'Conversion not found'
      });
    }

    res.status(200).json({
      success: true,
      data: conversion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get conversion status',
      error: error.message
    });
  }
};

// Get all conversions for a user
const getAllConversions = async (req, res) => {
  try {
    const conversions = await Conversion.find({ userId: req.user?._id })
      .populate('originalVideo', 'title thumbnail')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: conversions.length,
      data: conversions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversions',
      error: error.message
    });
  }
};

// Get all conversions (admin)
const getAllConversionsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const conversions = await Conversion.find(filter)
      .populate('originalVideo', 'title thumbnail')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: conversions.length,
      data: conversions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversions',
      error: error.message
    });
  }
};

// Delete conversion
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

    // Delete converted video from Cloudinary if it exists
    if (conversion.convertedPublicId) {
      const cloudinary = require('../config/cloudinary.config');
      await cloudinary.uploader.destroy(conversion.convertedPublicId, {
        resource_type: 'video'
      });
    }

    await Conversion.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Conversion deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversion',
      error: error.message
    });
  }
};

// Retry failed conversion
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

    if (conversion.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Only failed conversions can be retried'
      });
    }

    // Reset conversion status
    conversion.status = 'pending';
    conversion.progress = 0;
    conversion.error = null;
    await conversion.save();

    // Start processing again
    processConversion(conversion._id);

    res.status(200).json({
      success: true,
      message: 'Conversion retry started',
      data: conversion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retry conversion',
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
  retryConversion
};