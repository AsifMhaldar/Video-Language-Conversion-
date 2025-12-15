const express = require('express');
const router = express.Router();
const upload = require('../Middleware/multer');
const {
  uploadVideo,
  getAllVideos,
  getVideoById,
  deleteVideo,
  updateVideo
} = require('../Controller/video');

// If you have authentication middleware, import and use it
// const { authenticate } = require('../middleware/auth.middleware');

// Upload video - single file with field name 'video'
router.post('/upload', upload.single('video'), uploadVideo);

// Get all videos
router.get('/', getAllVideos);

// Get single video by ID
router.get('/:id', getVideoById);

// Update video details
router.patch('/:id', updateVideo);

// Delete video
router.delete('/:id', deleteVideo);

module.exports = router;