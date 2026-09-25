import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiTranslate, HiDownload, HiCalendar, HiFilm } from 'react-icons/hi';
import { formatFileSize, formatRelativeDate } from '../utils/format';

export default function VideoPlayerModal({ video, isOpen, onClose, onTranslate }) {
  if (!isOpen || !video) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = video.videoUrl;
    link.download = video.title || 'video.mp4';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-[#121222] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#16162a]">
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                <HiFilm className="text-xl" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-lg text-white truncate">{video.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="uppercase px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono">
                    {video.format || 'MP4'}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(video.size)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <HiCalendar className="text-xs" />
                    {formatRelativeDate(video.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Player"
            >
              <HiX className="text-xl" />
            </button>
          </div>

          {/* Video Player Box */}
          <div className="bg-black flex items-center justify-center relative overflow-hidden flex-1 min-h-[300px] max-h-[60vh]">
            <video
              src={video.videoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full max-h-[60vh] object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Footer Bar & Actions */}
          <div className="px-6 py-4 border-t border-white/10 bg-[#16162a] flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-gray-400 max-w-md truncate">
              {video.description ? video.description : 'Ready for AI translation and dubbing.'}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={handleDownload}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-sm font-medium flex items-center gap-2 transition-all hover:border-white/20"
              >
                <HiDownload className="text-base" />
                Download
              </button>

              <button
                onClick={() => {
                  onClose();
                  onTranslate(video);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <HiTranslate className="text-base" />
                Translate Video
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
