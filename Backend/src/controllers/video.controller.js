const Video = require('../models/video.model');
const ApiError = require('../utils/ApiError');
const { uploadVideoToCloudinary, deleteVideoFromCloudinary } = require('../services/cloudinary.service');

const assertVideoOwnership = (video, user) => {
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }
  if (video.uploadedBy && String(video.uploadedBy) !== String(user._id)) {
    throw new ApiError(404, 'Video not found');
  }
};

const uploadVideo = async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No video file provided');
  }

  const { title, description } = req.body;

  if (!title || !title.trim()) {
    throw new ApiError(400, 'Title is required');
  }

  const cloudinaryResult = await uploadVideoToCloudinary(req.file.path);

  const video = await Video.create({
    title: title.trim(),
    description,
    videoUrl: cloudinaryResult.url,
    publicId: cloudinaryResult.publicId,
    duration: cloudinaryResult.duration,
    format: cloudinaryResult.format,
    size: cloudinaryResult.size,
    thumbnail: cloudinaryResult.thumbnail,
    uploadedBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Video uploaded successfully',
    data: video
  });
};

const getAllVideos = async (req, res) => {
  const videos = await Video.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: videos.length,
    data: videos
  });
};

const getVideoById = async (req, res) => {
  const video = await Video.findById(req.params.id);

  assertVideoOwnership(video, req.user);

  res.status(200).json({
    success: true,
    data: video
  });
};

const updateVideo = async (req, res) => {
  const { title, description } = req.body;

  const video = await Video.findById(req.params.id);

  assertVideoOwnership(video, req.user);

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;

  const updated = await Video.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Video updated successfully',
    data: updated
  });
};

const deleteVideo = async (req, res) => {
  const video = await Video.findById(req.params.id);

  assertVideoOwnership(video, req.user);

  await deleteVideoFromCloudinary(video.publicId);
  await Video.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Video deleted successfully'
  });
};

module.exports = {
  uploadVideo,
  getAllVideos,
  getVideoById,
  deleteVideo,
  updateVideo
};
