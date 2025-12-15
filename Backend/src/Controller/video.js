const Video = require('../Models/video');
const { uploadVideoToCloudinary, deleteVideoFromCloudinary } = require('../Utils/cloudinary.js');

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const cloudinaryResult = await uploadVideoToCloudinary(req.file.path);

    const video = await Video.create({
      title,
      description,
      videoUrl: cloudinaryResult.url,
      publicId: cloudinaryResult.publicId,
      duration: cloudinaryResult.duration,
      format: cloudinaryResult.format,
      size: cloudinaryResult.size,
      thumbnail: cloudinaryResult.thumbnail,
      uploadedBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: video
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      error: error.message
    });
  }
};

const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos',
      error: error.message
    });
  }
};

const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video',
      error: error.message
    });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    await deleteVideoFromCloudinary(video.publicId);
    await Video.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete video',
      error: error.message
    });
  }
};

const updateVideo = async (req, res) => {
  try {
    const { title, description } = req.body;

    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update video',
      error: error.message
    });
  }
};

module.exports = {
  uploadVideo,
  getAllVideos,
  getVideoById,
  deleteVideo,
  updateVideo
};