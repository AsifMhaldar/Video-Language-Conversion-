// src/components/VideoUpload.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiUpload, HiX, HiCheck, HiVideoCamera, HiSparkles } from 'react-icons/hi';
import axios from 'axios';

function VideoUpload({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please upload a valid video file');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a valid video file');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!file || !title) {
      setError('Please provide both a video file and title');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      const response = await axios.post('http://localhost:3000/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        setUploadComplete(true);
        setTimeout(() => {
          onUploadSuccess && onUploadSuccess(response.data.data);
          handleClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload video');
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setUploading(false);
    setProgress(0);
    setUploadComplete(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2E] rounded-2xl border border-white/10 p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <HiSparkles className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Upload Video
                </h2>
                <p className="text-sm text-gray-400">Upload your video to translate</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
              disabled={uploading}
            >
              <HiX className="text-xl" />
            </button>
          </div>

          {uploadComplete ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                <HiCheck className="text-4xl" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Upload Successful!</h3>
              <p className="text-gray-400">Your video has been uploaded successfully</p>
            </motion.div>
          ) : (
            <>
              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 mb-6 transition-all ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-white/20 bg-white/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />

                {!file ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <HiUpload className="text-3xl" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Drop your video here</h3>
                    <p className="text-gray-400 mb-4">or</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                      disabled={uploading}
                    >
                      Browse Files
                    </button>
                    <p className="text-sm text-gray-500 mt-4">Supported formats: MP4, MOV, AVI, WebM (Max 100MB)</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HiVideoCamera className="text-2xl text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{file.name}</h4>
                      <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                    {!uploading && (
                      <button
                        onClick={() => setFile(null)}
                        className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors"
                      >
                        <HiX />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Video Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter video description"
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400"
                >
                  {error}
                </motion.div>
              )}

              {/* Progress Bar */}
              {uploading && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Uploading...</span>
                    <span className="text-sm font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || !title || uploading}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
                >
                  {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default VideoUpload;