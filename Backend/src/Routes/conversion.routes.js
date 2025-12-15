const express = require('express');
const router = express.Router();
const {
  startConversion,
  getConversionStatus,
  getAllConversions,
  getAllConversionsAdmin,
  deleteConversion,
  retryConversion
} = require('../Controller/conversion.controller');

// Start a new conversion
router.post('/convert', startConversion);

// Get all conversions for logged-in user
router.get('/user/all', getAllConversions);

// Get all conversions (admin only)
// router.get('/admin/all', authenticate, isAdmin, getAllConversionsAdmin);

// Retry failed conversion
router.post('/:id/retry', retryConversion);

// Get conversion status by ID
router.get('/:id', getConversionStatus);

// Delete conversion
router.delete('/:id', deleteConversion);

module.exports = router;
