// src/pages/LanguageConverter.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiSparkles, HiVideoCamera, HiUser, HiLogout, HiArrowLeft, 
  HiTranslate, HiCheck, HiChevronRight, HiPlay 
} from 'react-icons/hi';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LanguageConverter() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [step, setStep] = useState(1); // 1: Select Video, 2: Select Target Language, 3: Processing
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectedLanguage, setDetectedLanguage] = useState(null);

  // Available Languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  ];

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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setStep(2);
  };

  const handleStartConversion = async () => {
    if (!targetLanguage) {
      alert('Please select target language');
      return;
    }

    setStep(3);
    setConverting(true);
    setProgress(0);

    try {
      // Start conversion (language will be auto-detected)
      const response = await axios.post('http://localhost:3000/api/conversions/convert', {
        videoId: selectedVideo._id,
        targetLanguage
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Conversion failed');
      }

      const conversionId = response.data.data._id;
      
      // Poll for progress
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await axios.get(`http://localhost:3000/api/conversions/${conversionId}`);
          const { progress, status, sourceLanguage } = statusResponse.data.data;
          
          setProgress(progress);
          
          if (sourceLanguage && !detectedLanguage) {
            setDetectedLanguage(sourceLanguage);
          }
          
          if (status === 'completed') {
            clearInterval(pollInterval);
            setConverting(false);
            console.log('Conversion completed successfully');
          } else if (status === 'failed') {
            clearInterval(pollInterval);
            setConverting(false);
            alert('Conversion failed. Please try again.');
            setStep(2);
          }
        } catch (pollError) {
          console.error('Error polling status:', pollError);
          clearInterval(pollInterval);
          setConverting(false);
          alert('Error checking conversion status');
          setStep(2);
        }
      }, 2000);

      // Cleanup interval after 10 minutes (timeout)
      setTimeout(() => {
        clearInterval(pollInterval);
        if (converting) {
          setConverting(false);
          alert('Conversion timeout. Please check status later.');
        }
      }, 600000);

    } catch (error) {
      console.error('Conversion error:', error);
      setConverting(false);
      alert(error.response?.data?.message || 'Failed to start conversion');
      setStep(2);
    }
  };

  const resetProcess = () => {
    setStep(1);
    setSelectedVideo(null);
    setTargetLanguage('');
    setDetectedLanguage(null);
    setProgress(0);
    setConverting(false);
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
            Language <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Converter</span>
          </h1>
          <p className="text-gray-400">Convert your videos to different languages</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          {[1, 2, 3].map((stepNum) => (
            <React.Fragment key={stepNum}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= stepNum 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                    : 'bg-white/5 border border-white/10'
                }`}>
                  {step > stepNum ? <HiCheck className="text-2xl" /> : stepNum}
                </div>
                <div className="hidden md:block">
                  <div className={`text-sm font-semibold ${step >= stepNum ? 'text-white' : 'text-gray-500'}`}>
                    {stepNum === 1 && 'Select Video'}
                    {stepNum === 2 && 'Choose Language'}
                    {stepNum === 3 && 'Convert'}
                  </div>
                </div>
              </div>
              {stepNum < 3 && (
                <HiChevronRight className={`text-2xl ${step > stepNum ? 'text-blue-400' : 'text-gray-600'}`} />
              )}
            </React.Fragment>
          ))}
        </motion.div>

        {/* Step 1: Select Video */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <h2 className="text-2xl font-bold mb-6">Select a Video</h2>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading videos...</p>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HiVideoCamera className="text-4xl text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Videos Available</h3>
                    <p className="text-gray-400 mb-6">Upload a video first to start converting</p>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => (
                      <motion.div
                        key={video._id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleVideoSelect(video)}
                        className="cursor-pointer bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all overflow-hidden group"
                      >
                        <div className="relative h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                          {video.thumbnail ? (
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <HiVideoCamera className="text-5xl text-blue-400/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                              <HiPlay className="text-3xl ml-1" />
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold truncate mb-1">{video.title}</h3>
                          <p className="text-xs text-gray-400">
                            {formatFileSize(video.size)} • {video.format?.toUpperCase() || 'MP4'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Target Language Only */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Choose Target Language</h2>
                <p className="text-gray-400 mb-6">The source language will be automatically detected from your video</p>
                
                {/* Selected Video Display */}
                <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex-shrink-0">
                      {selectedVideo?.thumbnail ? (
                        <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HiVideoCamera className="text-3xl text-blue-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{selectedVideo?.title}</h3>
                      <p className="text-sm text-gray-400">
                        {formatFileSize(selectedVideo?.size)} • {selectedVideo?.format?.toUpperCase() || 'MP4'}
                      </p>
                      <p className="text-xs text-blue-400 mt-1">✨ Language will be auto-detected</p>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Target Language Selection */}
                <div>
                  <label className="block text-lg font-semibold mb-4">
                    Select Target Language (Convert to)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setTargetLanguage(lang.code)}
                        className={`p-4 rounded-xl border transition-all ${
                          targetLanguage === lang.code
                            ? 'bg-purple-500/20 border-purple-500'
                            : 'bg-white/5 border-white/10 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="text-3xl mb-2">{lang.flag}</div>
                        <div className="text-sm font-semibold">{lang.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStartConversion}
                    disabled={!targetLanguage}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
                  >
                    Start Conversion
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Processing */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-white/5 rounded-2xl border border-white/10 p-8 max-w-2xl mx-auto text-center">
                {converting ? (
                  <>
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <HiTranslate className="text-5xl" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Converting Video...</h2>
                    {detectedLanguage ? (
                      <p className="text-gray-400 mb-8">
                        Detected: {languages.find(l => l.code === detectedLanguage)?.name} → Converting to: {languages.find(l => l.code === targetLanguage)?.name}
                      </p>
                    ) : (
                      <p className="text-gray-400 mb-8">
                        Detecting language and converting to {languages.find(l => l.code === targetLanguage)?.name}
                      </p>
                    )}
                    
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Progress</span>
                        <span className="text-sm font-semibold">{progress}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-gray-500">This may take a few minutes...</p>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <HiCheck className="text-5xl" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Conversion Complete!</h2>
                    <p className="text-gray-400 mb-8">Your video has been successfully converted</p>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={resetProcess}
                        className="flex-1 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        Convert Another
                      </button>
                      <button
                        onClick={() => navigate('/video-history')}
                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold"
                      >
                        View History
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default LanguageConverter;