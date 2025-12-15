const cloudinary = require('../config/cloudinary'); // Update this path
const fs = require('fs');

const uploadVideoToCloudinary = async (filePath) => {
  try {
    // console.log('Starting Cloudinary upload for:', filePath);
    
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'videos',
      chunk_size: 6000000,
    });

    // console.log('Cloudinary upload successful:', result.public_id);
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
      size: result.bytes,
      thumbnail: result.secure_url
    };
  } catch (error) {
    // console.error('Cloudinary upload failed:', error.message);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

const deleteVideoFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video'
    });
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadVideoToCloudinary,
  deleteVideoFromCloudinary
};