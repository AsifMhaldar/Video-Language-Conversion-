// src/pages/VideoHistory.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiSparkles, HiVideoCamera, HiUser, HiLogout, HiArrowLeft, HiTrash, HiEye, HiDownload, HiCalendar, HiClock } from 'react-icons/hi';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function VideoHistory() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/videos');
      if (response.data.success) {
        setVideos(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = async (videoId) => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/videos/${videoId}`);
      if (response.data.success) {
        setVideos(videos.filter(v => v._id !== videoId));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  const handleDownload = (videoUrl, title) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A14] via-[#0F0F1A] to-[#0A0A14] text-white">
      {/* Navbar */}
      <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
          >
            <HiArrowLeft className="text-xl" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <HiSparkles className="text-2xl" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VideoLang AI
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <HiUser className="text-sm" />
            </div>
            <span className="text-sm">{user?.name || 'User'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2"
          >
            <HiLogout />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Video <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">History</span>
          </h1>
          <p className="text-gray-400">All your uploaded videos in one place</p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold mb-1">{videos.length}</div>
            <div className="text-sm text-gray-400">Total Videos</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold mb-1">
              {formatFileSize(videos.reduce((acc, v) => acc + (v.size || 0), 0))}
            </div>
            <div className="text-sm text-gray-400">Total Size</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold mb-1">
              {new Set(videos.map(v => v.format)).size}
            </div>
            <div className="text-sm text-gray-400">Formats</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold mb-1">
              {videos.filter(v => new Date(v.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-gray-400">This Week</div>
          </div>
        </motion.div>

        {/* Video Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiVideoCamera className="text-5xl text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Videos Yet</h3>
            <p className="text-gray-400 mb-6">Upload your first video to get started</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              Go to Dashboard
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all duration-300 group"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 overflow-hidden">
                  {video.thumbnail ? (
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HiVideoCamera className="text-6xl text-blue-400/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => window.open(video.videoUrl, '_blank')}
                      className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors"
                      title="View Video"
                    >
                      <HiEye className="text-xl" />
                    </button>
                    <button
                      onClick={() => handleDownload(video.videoUrl, video.title)}
                      className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
                      title="Download"
                    >
                      <HiDownload className="text-xl" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(video._id)}
                      className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                      title="Delete"
                    >
                      <HiTrash className="text-xl" />
                    </button>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs font-semibold">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 truncate">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{video.description}</p>
                  )}
                  
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <HiCalendar className="text-blue-400" />
                      <span>{formatDate(video.createdAt)}</span>
                      <HiClock className="text-purple-400 ml-2" />
                      <span>{formatTime(video.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                        {video.format?.toUpperCase() || 'MP4'}
                      </span>
                      <span className="text-gray-400">{formatFileSize(video.size)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2E] rounded-2xl border border-white/10 p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiTrash className="text-3xl text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Delete Video?</h3>
            <p className="text-gray-400 text-center mb-6">
              This action cannot be undone. The video will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition-colors font-semibold"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default VideoHistory;