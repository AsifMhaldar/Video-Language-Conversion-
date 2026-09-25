import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiSparkles,
  HiVideoCamera,
  HiTranslate,
  HiClock,
  HiLogout,
  HiUpload,
  HiServer,
  HiX
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { formatFileSize } from '../utils/format';

export default function Sidebar({
  isOpen,
  onClose,
  onOpenUpload,
  totalSize = 0,
  videoCount = 0
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <HiVideoCamera className="text-xl" />,
      badge: videoCount > 0 ? `${videoCount}` : null
    },
    {
      to: '/language-converter',
      label: 'AI Dub Studio',
      icon: <HiTranslate className="text-xl" />,
      badge: '50+ Langs'
    },
    {
      to: '/video-history',
      label: 'History & Library',
      icon: <HiClock className="text-xl" />
    }
  ];

  // Storage percentage calculation (assume free tier 100 MB)
  const maxStorageBytes = 100 * 1024 * 1024;
  const storagePercentage = Math.min(100, Math.round((totalSize / maxStorageBytes) * 100)) || 2;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0c0c16] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <HiSparkles className="text-2xl text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">
                  VideoLang
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Video Dubbing Platform</p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        {/* Primary CTA Button */}
        <div className="px-5 pt-5 pb-2">
          <button
            onClick={() => {
              if (onOpenUpload) onOpenUpload();
              if (onClose) onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 text-white font-medium text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <HiUpload className="text-lg" />
            <span>Upload New Video</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Main Menu
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-sm shadow-blue-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 group-hover:text-blue-400 transition-colors">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Storage / Usage Meter Widget */}
        <div className="p-4 mx-4 mb-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-1.5 text-gray-300 font-medium">
              <HiServer className="text-blue-400" />
              Cloud Storage
            </span>
            <span className="text-gray-400 font-mono">
              {formatFileSize(totalSize)}
            </span>
          </div>

          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${storagePercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Free Tier (100 MB)</span>
            <span className="text-blue-400 font-semibold">{storagePercentage}%</span>
          </div>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0f0f1b] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || 'Logged in'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
          >
            <HiLogout className="text-xl" />
          </button>
        </div>
      </aside>
    </>
  );
}
