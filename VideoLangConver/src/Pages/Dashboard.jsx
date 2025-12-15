// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiSparkles, HiVideoCamera, HiTranslate, HiDownload, HiUser, HiLogout } from 'react-icons/hi';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import VideoUpload from '../Component/VideoUpload';
import axios from 'axios';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fetch videos from backend
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

  const handleUploadSuccess = (newVideo) => {
    setVideos([newVideo, ...videos]);
    fetchVideos(); // Refresh the list
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Calculate real-time stats
  const totalVideos = videos.length;
  const totalSize = videos.reduce((acc, v) => acc + (v.size || 0), 0);
  const uniqueFormats = new Set(videos.map(v => v.format?.toUpperCase() || 'MP4')).size;
  
  const formatTotalSize = (bytes) => {
    if (bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const stats = [
    { icon: <HiVideoCamera />, label: 'Videos Uploaded', value: totalVideos.toString(), color: 'from-blue-500 to-cyan-500' },
    { icon: <HiTranslate />, label: 'Languages', value: uniqueFormats.toString(), color: 'from-purple-500 to-pink-500', action: () => navigate('/language-converter') },
    { icon: <HiDownload />, label: 'Total Size', value: formatTotalSize(totalSize), color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A14] via-[#0F0F1A] to-[#0A0A14] text-white">
      {/* Navbar */}
      <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <HiSparkles className="text-2xl" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            VideoLang AI
          </h2>
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
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user?.name}</span>!
          </h1>
          <p className="text-gray-400">Here's what's happening with your videos</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={stat.action}
              className={`p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm ${stat.action ? 'cursor-pointer hover:border-blue-500/30 transition-all' : ''}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <div className="text-xl">{stat.icon}</div>
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Videos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Your Videos</h3>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
            >
              <HiVideoCamera />
              Upload New
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading videos...</div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiVideoCamera className="text-4xl text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No videos yet</h4>
              <p className="text-gray-400 mb-6">Upload your first video to get started</p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                Upload Video
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map((video, index) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex-shrink-0">
                      {video.thumbnail ? (
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HiVideoCamera className="text-2xl text-blue-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{video.title}</h4>
                      <p className="text-sm text-gray-400 truncate">
                        {video.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{formatFileSize(video.size)}</span>
                        <span>•</span>
                        <span>{video.format?.toUpperCase() || 'MP4'}</span>
                        <span>•</span>
                        <span>{formatDate(video.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <HiVideoCamera className="text-xl" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-lg">Upload New Video</h4>
                <p className="text-gray-400 text-sm">Start translating a new video</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => navigate('/video-history')}
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <HiTranslate className="text-xl" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-lg">View History</h4>
                <p className="text-gray-400 text-sm">Check all your translations</p>
              </div>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Video Upload Modal */}
      <VideoUpload 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}

export default Dashboard;