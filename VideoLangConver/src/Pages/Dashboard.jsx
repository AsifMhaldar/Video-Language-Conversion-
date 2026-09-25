// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSparkles,
  HiVideoCamera,
  HiTranslate,
  HiDownload,
  HiTrash,
  HiPlay,
  HiSearch,
  HiPlus,
  HiMenu,
  HiClock,
  HiCheckCircle,
  HiFilm,
  HiChevronRight,
  HiVolumeUp
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import VideoUpload from '../components/VideoUpload';
import VideoPlayerModal from '../components/VideoPlayerModal';
import Sidebar from '../components/Sidebar';
import { fetchVideos, deleteVideoById } from '../api/video.api';
import { formatFileSize, formatRelativeDate } from '../utils/format';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // App States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Videos State
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [failedThumbnails, setFailedThumbnails] = useState({});

  // Fetch videos from backend
  const loadVideos = async () => {
    try {
      const response = await fetchVideos();
      if (response.data?.success) {
        setVideos(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleUploadSuccess = (newVideo) => {
    setVideos((prev) => [newVideo, ...prev]);
    loadVideos();
  };

  const handleThumbnailError = (id) => {
    setFailedThumbnails((prev) => ({ ...prev, [id]: true }));
  };

  const handleStartTranslate = (video) => {
    navigate('/language-converter', { state: { video } });
  };

  const handleDeleteVideo = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      const res = await deleteVideoById(deleteCandidate._id);
      if (res.data?.success) {
        setVideos((prev) => prev.filter((v) => v._id !== deleteCandidate._id));
        setDeleteCandidate(null);
      }
    } catch (err) {
      console.error('Error deleting video:', err);
      alert('Failed to delete video. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered list
  const filteredVideos = videos.filter((v) =>
    (v.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculated Stats
  const totalVideos = videos.length;
  const totalSizeBytes = videos.reduce((acc, v) => acc + (v.size || 0), 0);
  const formatTotalSize = (bytes) => (formatFileSize(bytes) === 'N/A' ? '0 MB' : formatFileSize(bytes));

  const stats = [
    {
      title: 'Uploaded Videos',
      value: totalVideos === 1 ? '1 Video' : `${totalVideos} Videos`,
      subtitle: totalVideos > 0 ? 'Ready for AI processing' : 'No videos uploaded yet',
      icon: <HiVideoCamera className="text-2xl text-blue-400" />,
      glowColor: 'from-blue-500/10 to-cyan-500/5',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'AI Dubbing Engine',
      value: '50+ Languages',
      subtitle: 'Neural voiceover & captions',
      icon: <HiTranslate className="text-2xl text-purple-400" />,
      glowColor: 'from-purple-500/10 to-pink-500/5',
      borderColor: 'border-purple-500/20',
      action: () => navigate('/language-converter')
    },
    {
      title: 'Pipeline Status',
      value: 'Active & Ready',
      subtitle: 'Speech-to-text & TTS ready',
      icon: <HiCheckCircle className="text-2xl text-emerald-400" />,
      glowColor: 'from-emerald-500/10 to-teal-500/5',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Cloud Storage',
      value: formatTotalSize(totalSizeBytes),
      subtitle: 'Media assets stored',
      icon: <HiDownload className="text-2xl text-amber-400" />,
      glowColor: 'from-amber-500/10 to-orange-500/5',
      borderColor: 'border-amber-500/20'
    }
  ];

  const popularLanguages = [
    { code: 'es', label: 'Spanish', flag: '🇪🇸' },
    { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
    { code: 'fr', label: 'French', flag: '🇫🇷' },
    { code: 'de', label: 'German', flag: '🇩🇪' },
    { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
    { code: 'ar', label: 'Arabic', flag: '🇸🇦' }
  ];

  return (
    <div className="min-h-screen bg-[#090912] text-white flex">
      {/* SaaS Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        totalSize={totalSizeBytes}
        videoCount={totalVideos}
      />

      {/* Main App Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#090912]/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300"
              aria-label="Open sidebar"
            >
              <HiMenu className="text-xl" />
            </button>

            <div>
              <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <span>Dashboard</span>
                <span className="hidden sm:inline-block text-xs font-normal text-gray-400">
                  / Studio Overview
                </span>
              </h1>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/language-converter')}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs md:text-sm font-medium transition-colors"
            >
              <HiTranslate className="text-base" />
              <span>Dub Studio</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs md:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <HiPlus className="text-base" />
              <span>Upload Video</span>
            </button>

            <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-200">
                {user?.name || 'User'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Body Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Hero Dubbing Studio Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-6 md:p-8 border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-[#13112c]/70 to-[#0c0c16] shadow-2xl backdrop-blur-md"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-medium">
                  <HiSparkles className="text-blue-400 text-sm" />
                  <span>Next-Gen AI Video Dubbing</span>
                </div>

                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Dub Your Videos Into Any Language with{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                    1-Click AI
                  </span>
                </h2>

                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  Automatic speech transcription, fluent translation, natural neural voice synthesis, and synchronized subtitle burning all in one seamless workflow.
                </p>

                {/* Popular Language Badges */}
                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-400 font-medium">Popular:</span>
                  {popularLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => navigate('/language-converter')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[200px]">
                <button
                  onClick={() => navigate('/language-converter')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
                >
                  <HiTranslate className="text-lg" />
                  <span>Start Dubbing Studio</span>
                </button>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <HiPlus className="text-lg" />
                  <span>Upload Video</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={stat.action}
                className={`p-5 rounded-2xl bg-gradient-to-b ${stat.glowColor} bg-[#11111e]/60 border ${stat.borderColor} backdrop-blur-sm relative overflow-hidden transition-all duration-300 ${
                  stat.action ? 'cursor-pointer hover:border-purple-500/50 hover:scale-[1.02]' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-white tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Video Library / Studio Manager */}
          <section className="space-y-4">
            {/* Header + Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Your Videos</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {videos.length}
                  </span>
                </h3>
              </div>

              {/* Search filter input */}
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-200 flex items-center gap-2 transition-colors flex-shrink-0"
                >
                  <HiPlus />
                  <span className="hidden sm:inline">Add Video</span>
                </button>
              </div>
            </div>

            {/* Videos List / Grid */}
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-400">Loading your video studio...</p>
              </div>
            ) : filteredVideos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 px-6 text-center rounded-2xl bg-white/5 border border-white/10 border-dashed"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                  <HiVideoCamera className="text-3xl" />
                </div>
                {searchQuery ? (
                  <>
                    <h4 className="text-lg font-semibold text-white mb-1">No matching videos</h4>
                    <p className="text-sm text-gray-400 mb-4">
                      No video titles matched "{searchQuery}"
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm text-white"
                    >
                      Clear Search Filter
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className="text-lg font-semibold text-white mb-1">No videos uploaded yet</h4>
                    <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto">
                      Upload your first MP4, MOV, or AVI video to translate speech into 50+ languages with neural dubbing.
                    </p>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium text-sm inline-flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
                    >
                      <HiPlus className="text-base" />
                      Upload First Video
                    </button>
                  </>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredVideos.map((video, idx) => {
                  const hasBrokenThumb = failedThumbnails[video._id] || !video.thumbnail;

                  return (
                    <motion.div
                      key={video._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="group p-4 rounded-2xl bg-[#11111f]/80 hover:bg-[#151528] border border-white/10 hover:border-blue-500/30 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Interactive Thumbnail */}
                        <div
                          onClick={() => setPreviewVideo(video)}
                          className="relative w-24 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-black flex-shrink-0 cursor-pointer border border-white/10 group-hover:border-blue-500/50 transition-all"
                        >
                          {!hasBrokenThumb ? (
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              onError={() => handleThumbnailError(video._id)}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-blue-400 bg-gradient-to-br from-blue-950/60 to-purple-950/60">
                              <HiFilm className="text-2xl" />
                            </div>
                          )}

                          {/* Hover Play Icon Overlay */}
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-all">
                            <div className="w-8 h-8 rounded-full bg-blue-500/80 group-hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all">
                              <HiPlay className="text-base ml-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Video Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              onClick={() => setPreviewVideo(video)}
                              className="font-semibold text-base text-white truncate hover:text-blue-400 cursor-pointer transition-colors"
                              title={video.title}
                            >
                              {video.title}
                            </h4>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/10 flex-shrink-0">
                              {video.format || 'MP4'}
                            </span>
                          </div>

                          <p className="text-xs text-gray-400 truncate max-w-xl">
                            {video.description || 'Uploaded video ready for AI dubbing and translation.'}
                          </p>

                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                            <span className="text-gray-400 font-mono">
                              {formatFileSize(video.size)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <HiClock className="text-xs" />
                              {formatRelativeDate(video.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center justify-end gap-2.5 pt-2 md:pt-0 border-t border-white/5 md:border-t-0">
                        {/* Direct Play/Preview In-App */}
                        <button
                          onClick={() => setPreviewVideo(video)}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-colors"
                          title="Watch video inside app"
                        >
                          <HiPlay className="text-sm text-blue-400" />
                          <span>Watch</span>
                        </button>

                        {/* Primary Dubbing Action Button */}
                        <button
                          onClick={() => handleStartTranslate(video)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.03] active:scale-[0.98]"
                        >
                          <HiTranslate className="text-sm" />
                          <span>Translate / Dub</span>
                        </button>

                        {/* Download Original */}
                        <a
                          href={video.videoUrl}
                          download={video.title || 'video.mp4'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
                          title="Download Video"
                        >
                          <HiDownload className="text-base" />
                        </a>

                        {/* Delete Video */}
                        <button
                          onClick={() => setDeleteCandidate(video)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-colors"
                          title="Delete Video"
                        >
                          <HiTrash className="text-base" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div
              onClick={() => navigate('/language-converter')}
              className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-[#121226] border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer group transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <HiTranslate />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white group-hover:text-blue-300 transition-colors">
                      AI Dubbing Studio
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Select target voice, language, and auto-generate subtitles
                    </p>
                  </div>
                </div>
                <HiChevronRight className="text-xl text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            <div
              onClick={() => navigate('/video-history')}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 to-[#121226] border border-purple-500/20 hover:border-purple-500/40 cursor-pointer group transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                    <HiClock />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                      Conversion History
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Access all translated dubs, audio outputs, and media files
                    </p>
                  </div>
                </div>
                <HiChevronRight className="text-xl text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Video Upload Modal */}
      <VideoUpload
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* In-App Video Player Modal */}
      <VideoPlayerModal
        video={previewVideo}
        isOpen={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
        onTranslate={handleStartTranslate}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl bg-[#151528] border border-red-500/30 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center text-2xl mx-auto">
                <HiTrash />
              </div>
              <div className="text-center space-y-1.5">
                <h4 className="text-lg font-bold text-white">Delete Video?</h4>
                <p className="text-sm text-gray-400">
                  Are you sure you want to delete{' '}
                  <span className="text-white font-medium">"{deleteCandidate.title}"</span>? This will also remove the Cloudinary media asset.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteCandidate(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVideo}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-lg shadow-red-600/30 transition-colors flex items-center justify-center gap-2"
                >
                  {deleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;