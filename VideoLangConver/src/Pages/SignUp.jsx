// src/Pages/SignUp.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiMail, 
  HiUser, 
  HiEye, 
  HiEyeOff, 
  HiArrowLeft, 
  HiCheck, 
  HiShieldCheck, 
  HiSparkles,
  HiKey,
  HiLockClosed
} from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaTwitter } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    newsletter: true
  });
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions');
      setLoading(false);
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }
    
    setLoading(false);
  };

  const socialProviders = [
    { name: 'Google', icon: <FcGoogle />, color: 'hover:bg-white/5' },
    { name: 'GitHub', icon: <FaGithub />, color: 'hover:bg-gray-900/20' },
    { name: 'Twitter', icon: <FaTwitter className="text-blue-400" />, color: 'hover:bg-blue-500/10' }
  ];

  const benefits = [
    { icon: <HiSparkles />, text: "7-day free trial" },
    { icon: <HiShieldCheck />, text: "No credit card required" },
    { icon: <HiCheck />, text: "Cancel anytime" }
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
          className="absolute top-1/4 -left-20 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"
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
          {/* Left Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 max-w-lg"
          >
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 lg:p-12 shadow-2xl">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <HiSparkles className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    VideoLang AI
                  </h1>
                  <p className="text-gray-400 text-sm">Join 50,000+ creators</p>
                </div>
              </div>

              {/* Form Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Create your account</h2>
                <p className="text-gray-400">
                  Start your 7-day free trial. No credit card required.
                </p>
                
                {/* Error Display */}
                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Social Sign Up */}
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
                      Or continue with email
                    </span>
                  </div>
                </div>
              </div>

              {/* Sign Up Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <HiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300"
                      placeholder="John Doe"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

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
                    <HiKey className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300"
                      placeholder="••••••••"
                      required
                      minLength={8}
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
                  <p className="text-xs text-gray-500 mt-2">
                    Must be at least 8 characters
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        className="sr-only"
                        required
                        disabled={loading}
                      />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 ${formData.acceptTerms ? 'bg-blue-500 border-blue-500' : 'bg-white/5 border-white/10'}`}>
                        {formData.acceptTerms && <HiCheck className="text-white" />}
                      </div>
                    </div>
                    <span className="text-sm text-gray-300">
                      I agree to the{' '}
                      <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Privacy Policy
                      </a>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleChange}
                        className="sr-only"
                        disabled={loading}
                      />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 ${formData.newsletter ? 'bg-blue-500 border-blue-500' : 'bg-white/5 border-white/10'}`}>
                        {formData.newsletter && <HiCheck className="text-white" />}
                      </div>
                    </div>
                    <span className="text-sm text-gray-300">
                      Subscribe to our newsletter for updates and tips
                    </span>
                  </label>
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
                      Creating Account...
                    </div>
                  ) : (
                    'Start Free Trial'
                  )}
                </motion.button>

                {/* Already have account */}
                <p className="text-center text-gray-400">
                  Already have an account?{' '}
                  <NavLink to="/signin" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    Sign in
                  </NavLink>
                </p>
              </form>
            </div>
          </motion.div>

          {/* Right Side - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2 max-w-xl"
          >
            <div className="relative">
              {/* Content Card */}
              <div className="relative z-10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 lg:p-12">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold mb-4">
                    Join the future of <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">video translation</span>
                  </h3>
                  <p className="text-gray-300 text-lg">
                    Unlock the power of AI to make your videos globally accessible
                  </p>
                </div>

                {/* Benefits List */}
                <div className="space-y-6 mb-10">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <div className="text-blue-400 text-xl">
                          {benefit.icon}
                        </div>
                      </div>
                      <span className="text-lg font-medium">{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 mb-10">
                  {[
                    { value: "50K+", label: "Creators" },
                    { value: "120+", label: "Languages" },
                    { value: "99.5%", label: "Accuracy" },
                    { value: "2M+", label: "Videos" }
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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="font-bold">JD</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">John Doe</h4>
                      <p className="text-gray-400 text-sm">Creator @TechTube</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">
                    "VideoLang AI transformed my channel. I went from 10K to 100K subscribers by translating my content. The lip sync is incredible!"
                  </p>
                </motion.div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ⬇️ THIS LINE IS CRITICAL - ADD IT AT THE END ⬇️
export default SignUp;