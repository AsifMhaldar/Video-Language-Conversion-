const { SUPPORTED_LANGUAGES } = require('../Utils/language.utils');

// Validate conversion request
const validateConversionRequest = (req, res, next) => {
  const { videoId, targetLanguage } = req.body;

  // Check required fields
  if (!videoId) {
    return res.status(400).json({
      success: false,
      message: 'Video ID is required'
    });
  }

  if (!targetLanguage) {
    return res.status(400).json({
      success: false,
      message: 'Target language is required'
    });
  }

  // Validate video ID format (MongoDB ObjectId)
  if (!/^[0-9a-fA-F]{24}$/.test(videoId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid video ID format'
    });
  }

  // Validate target language
  if (!SUPPORTED_LANGUAGES[targetLanguage]) {
    return res.status(400).json({
      success: false,
      message: `Unsupported target language: ${targetLanguage}. Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`
    });
  }

  next();
};

// Rate limiting for conversions (optional)
const conversionRateLimit = (req, res, next) => {
  // Implement rate limiting logic here
  // For example: limit to 5 conversions per hour per user
  
  // This is a simple in-memory implementation
  // In production, use Redis or similar
  if (!global.conversionLimits) {
    global.conversionLimits = {};
  }

  const userId = req.user?._id || req.ip;
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (!global.conversionLimits[userId]) {
    global.conversionLimits[userId] = [];
  }

  // Remove old timestamps
  global.conversionLimits[userId] = global.conversionLimits[userId].filter(
    timestamp => now - timestamp < oneHour
  );

  // Check limit
  if (global.conversionLimits[userId].length >= 5) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Maximum 5 conversions per hour.'
    });
  }

  // Add current timestamp
  global.conversionLimits[userId].push(now);

  next();
};

// Check conversion ownership
const checkConversionOwnership = async (req, res, next) => {
  try {
    const Conversion = require('../Models/conversion.model');
    const { id } = req.params;

    const conversion = await Conversion.findById(id);

    if (!conversion) {
      return res.status(404).json({
        success: false,
        message: 'Conversion not found'
      });
    }

    // If user is authenticated and not the owner, deny access
    if (req.user && conversion.userId && 
        conversion.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this conversion.'
      });
    }

    req.conversion = conversion;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking conversion ownership',
      error: error.message
    });
  }
};

module.exports = {
  validateConversionRequest,
  conversionRateLimit,
  checkConversionOwnership
};