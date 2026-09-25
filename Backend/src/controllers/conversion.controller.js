const { v4: uuidv4 } = require('uuid');

const Video = require('../models/video.model');
const Conversion = require('../models/conversion.model');
const ApiError = require('../utils/ApiError');
const {
  startConversionProcess,
  getStatusFromMemory,
  setStatusInMemory
} = require('../services/conversionPipeline.service');
const { SUPPORTED_LANGUAGES, CONVERSION_STATUS } = require('../constants');

const startConversion = async (req, res) => {
  const { videoId, targetLanguage, enableLipsync = false } = req.body;

  if (!videoId) {
    throw new ApiError(400, 'Video ID is required');
  }

  if (!targetLanguage) {
    throw new ApiError(400, 'Target language is required');
  }

  if (!SUPPORTED_LANGUAGES[targetLanguage]) {
    throw new ApiError(
      400,
      `Unsupported target language: ${targetLanguage}. Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`
    );
  }

  const video = await Video.findOne({ _id: videoId, uploadedBy: req.user._id });
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  const conversionId = uuidv4();
  const userId = req.user._id;

  const conversion = new Conversion({
    videoId,
    userId,
    conversionId,
    targetLanguage,
    enableLipsync,
    status: CONVERSION_STATUS.PROCESSING,
    progress: 0,
    currentStep: 'Starting conversion...',
    sourceLanguage: 'detecting...',
    originalVideoUrl: video.videoUrl,
    originalVideoTitle: video.title
  });

  await conversion.save();

  setStatusInMemory(conversionId, {
    videoId,
    targetLanguage,
    userId: String(userId),
    status: CONVERSION_STATUS.PROCESSING,
    progress: 0,
    currentStep: 'Starting conversion...',
    sourceLanguage: 'detecting...',
    createdAt: new Date().toISOString()
  });

  startConversionProcess(conversionId, video, targetLanguage, enableLipsync, userId);

  console.log('Conversion request received:', {
    conversionId,
    videoId,
    targetLanguage,
    enableLipsync,
    userId
  });

  res.status(200).json({
    success: true,
    message: 'Conversion started successfully',
    data: {
      conversionId,
      message:
        'Conversion is being processed. Use the conversion ID to check status.'
    }
  });
};

const getConversionStatus = async (req, res) => {
  const { id } = req.params;
  const userId = String(req.user._id);

  const cachedStatus = getStatusFromMemory(id);

  if (cachedStatus) {
    if (cachedStatus.userId && cachedStatus.userId !== userId) {
      throw new ApiError(404, 'Conversion not found');
    }
    return res.json({
      success: true,
      data: cachedStatus
    });
  }

  const conversion = await Conversion.findOne({ conversionId: id, userId });

  if (!conversion) {
    throw new ApiError(404, 'Conversion not found');
  }

  res.json({
    success: true,
    data: {
      videoId: conversion.videoId,
      targetLanguage: conversion.targetLanguage,
      status: conversion.status,
      progress: conversion.progress,
      currentStep: conversion.currentStep,
      sourceLanguage: conversion.sourceLanguage,
      error: conversion.error,
      cloudinaryUrl: conversion.cloudinaryUrl,
      createdAt: conversion.createdAt,
      updatedAt: conversion.updatedAt
    }
  });
};

module.exports = { startConversion, getConversionStatus };
