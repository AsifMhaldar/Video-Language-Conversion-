const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const {
  startConversion,
  getConversionStatus
} = require('../controllers/conversion.controller');

router.post('/convert', authMiddleware, startConversion);
router.get('/:id', authMiddleware, getConversionStatus);

module.exports = router;
