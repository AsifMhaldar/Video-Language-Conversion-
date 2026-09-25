const express = require('express');
const router = express.Router();
const uploadSingleVideo = require('../middlewares/upload.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  uploadVideo,
  getAllVideos,
  getVideoById,
  deleteVideo,
  updateVideo
} = require('../controllers/video.controller');

router.post('/upload', authMiddleware, uploadSingleVideo, uploadVideo);
router.get('/', authMiddleware, getAllVideos);
router.get('/:id', authMiddleware, getVideoById);
router.patch('/:id', authMiddleware, updateVideo);
router.delete('/:id', authMiddleware, deleteVideo);

module.exports = router;
