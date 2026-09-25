const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const uploadVideoToCloudinary = async (filePath) => {
  try {
    console.log(`Uploading video: ${path.basename(filePath)}`);

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'videos',
      chunk_size: 6000000,
      eager: [{ width: 300, height: 300, crop: 'fill' }],
      eager_async: true
    });

    console.log(`Video uploaded: ${result.public_id}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
      size: result.bytes,
      thumbnail:
        result.eager && result.eager[0]
          ? result.eager[0].secure_url
          : result.secure_url
    };
  } catch (error) {
    console.error('Video upload failed:', error.message);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

const uploadCaptionedVideo = async (filePath, title, conversionId, userId) => {
  try {
    console.log(`Uploading converted video: ${path.basename(filePath)}`);

    const timestamp = Date.now();
    const safeTitle = title
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: `conversions/${userId}/${conversionId}`,
      public_id: `${safeTitle}_${timestamp}`,
      chunk_size: 6000000,
      overwrite: true,
      eager: [
        { width: 300, height: 300, crop: 'fill' },
        { width: 640, height: 360, crop: 'fill' }
      ],
      eager_async: true,
      context: {
        conversionId: conversionId,
        userId: userId.toString()
      }
    });

    console.log(`Converted video uploaded: ${result.public_id}`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
      size: result.bytes,
      thumbnail:
        result.eager && result.eager[0]
          ? result.eager[0].secure_url
          : result.secure_url,
      previewUrl:
        result.eager && result.eager[1]
          ? result.eager[1].secure_url
          : result.secure_url
    };
  } catch (error) {
    console.error('Converted video upload failed:', error.message);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

const deleteVideoFromCloudinary = async (publicId) => {
  try {
    console.log(`Deleting video: ${publicId}`);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video'
    });

    console.log(`Video deleted: ${publicId}`);
    return result;
  } catch (error) {
    console.error('Failed to delete video:', error.message);
    throw error;
  }
};

module.exports = {
  uploadVideoToCloudinary,
  uploadCaptionedVideo,
  deleteVideoFromCloudinary
};
