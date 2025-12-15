// src/Pages/SignIn.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowLeft, HiSparkles, HiCheck, HiShieldCheck } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaTwitter } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
    
    setLoading(false);
  };

  const socialProviders = [
    { name: 'Google', icon: <FcGoogle />, color: 'hover:bg-white/5' },
    { name: 'GitHub', icon: <FaGithub />, color: 'hover:bg-gray-900/20' },
    { name: 'Twitter', icon: <FaTwitter className="text-blue-400" />, color: 'hover:bg-blue-500/10' }
  ];

  const features = [
    { icon: <HiSparkles />, text: "Translate videos in 120+ languages" },
    { icon: <HiCheck />, text: "Perfect AI lip sync technology" },
    { icon: <HiShieldCheck />, text: "Enterprise-grade security" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A14] via-[#0F0F1A] to-[#0A0A14] text-white overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
            initial={{
              x: Math.random() * 100 + 'vw',
              y: Math.random() * 100 + 'vh'
            }}
            animate={{
              x: [null, Math.random() * 100 + 'vw'],
              y: [null, Math.random() * 100 + 'vh']
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Floating Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -right-20 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], rotate: [360, 0, 360] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* Back to Home Button */}
      <div className="fixed top-6 left-6 z-50">
        <NavLink
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
        >
          <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back to Home</span>
        </NavLink>
      </div>

      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center py-12">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12">
          {/* Left Side - Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 max-w-xl"
          >
            <div className="relative">
              {/* Content Card */}
              <div className="relative z-10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 lg:p-12">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <HiSparkles className="text-2xl" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        VideoLang AI
                      </h1>
                      <p className="text-gray-400 text-sm">Welcome back!</p>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">
                    Transform Your Videos <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Globally</span>
                  </h3>
                  <p className="text-gray-300 text-lg">
                    Access your account and continue creating multilingual content for a global audience.
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-6 mb-10">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <div className="text-blue-400 text-xl">
                          {feature.icon}
                        </div>
                      </div>
                      <span className="text-lg font-medium">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 mb-10">
                  {[
                    { value: "50K+", label: "Active Creators" },
                    { value: "2M+", label: "Videos Translated" },
                    { value: "120+", label: "Languages" },
                    { value: "99.5%", label: "Accuracy Rate" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.7 }}
                      className="text-center p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="text-2xl font-bold text-blue-400">{stat.value}</div>
                      <div className="text-gray-400 text-sm">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Testimonial */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="relative p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="font-bold">SR</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Sarah Chen</h4>
                      <p className="text-gray-400 text-sm">Education Creator</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">
                    "Signing in took seconds. Now I can manage all my translated videos from one dashboard. The analytics are incredibly helpful!"
                  </p>
                </motion.div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2 max-w-lg"
          >
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 lg:p-12 shadow-2xl">
              {/* Form Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
                <p className="text-gray-400">
                  Sign in to your account to continue creating amazing content.
                </p>
                
                {/* Error Display */}
                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Social Sign In */}
              <div className="mb-8">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {socialProviders.map((provider, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border border-white/10 ${provider.color} transition-all duration-300`}
                    >
                      {provider.icon}
                      <span className="text-sm hidden sm:inline">{provider.name}</span>
                    </motion.button>
                  ))}
                </div>
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gradient-to-br from-white/5 to-white/10 text-gray-400">
                      Or sign in with email
                    </span>
                  </div>
                </div>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <HiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300"
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="sr-only"
                        disabled={loading}
                      />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 ${rememberMe ? 'bg-blue-500 border-blue-500' : 'bg-white/5 border-white/10'}`}>
                        {rememberMe && <HiCheck className="text-white text-xs" />}
                      </div>
                    </div>
                    <span className="text-sm text-gray-300">Remember me</span>
                  </label>
                  <NavLink
                    to="/forgot-password"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </NavLink>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    loading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>

                {/* Sign Up Link */}
                <p className="text-center text-gray-400">
                  Don't have an account?{' '}
                  <NavLink to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    Sign up for free
                  </NavLink>
                </p>

                {/* Security Note */}
                <div className="flex items-center gap-2 text-sm text-gray-500 justify-center mt-4">
                  <HiShieldCheck className="text-green-500" />
                  <span>Your data is securely encrypted</span>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ⬇️ ADD THIS LINE AT THE END ⬇️
export default SignIn;