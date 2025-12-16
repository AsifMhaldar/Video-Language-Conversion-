const express = require('express');
const router = express.Router();
const {
  startConversion,
  getConversionStatus,
  getAllConversions,
  getAllConversionsAdmin,
  deleteConversion,
  retryConversion,
  cancelConversion
} = require('../Controller/conversion.controller');

const { 
  validateConversionRequest,
  conversionRateLimit,
  checkConversionOwnership 
} = require('../Middleware/conversion.validation');

const { runEnvironmentCheck } = require('../Utils/pythonExecutor');

// Environment check endpoint
router.get('/environment-check', async (req, res) => {
  try {
    const result = await runEnvironmentCheck();
    
    res.status(200).json({
      success: true,
      data: result,
      message: result.ready ? 
        'Environment is ready for video conversion' : 
        'Environment setup incomplete - check console for details'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check environment',
      error: error.message
    });
  }
});

// Start a new conversion
// Body: { videoId, targetLanguage, enableLipsync (optional) }
router.post(
  '/convert',
  validateConversionRequest,
  conversionRateLimit,
  startConversion
);

// Get all conversions for logged-in user
// Query params: status (optional), page, limit
router.get('/user/all', getAllConversions);

// Get all conversions (admin only)
// Query params: status (optional), page, limit
// TODO: Add authenticate and isAdmin middleware
// router.get('/admin/all', authenticate, isAdmin, getAllConversionsAdmin);
router.get('/admin/all', getAllConversionsAdmin);

// Get conversion status by ID
router.get('/:id', getConversionStatus);

// Retry failed conversion
router.post('/:id/retry', checkConversionOwnership, retryConversion);

// Cancel ongoing conversion
router.post('/:id/cancel', checkConversionOwnership, cancelConversion);

// Delete conversion
router.delete('/:id', checkConversionOwnership, deleteConversion);

// Get conversion statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const Conversion = require('../Models/conversion.model');
    const userId = req.user?._id;
    
    const stats = await Conversion.getStats(userId);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

module.exports = router;