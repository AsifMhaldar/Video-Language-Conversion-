// src/Pages/Landings.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { HiMenu, HiX, HiPlay, HiCheck, HiGlobe, HiLightningBolt, HiSparkles, HiMicrophone, HiDeviceMobile, HiTranslate, HiArrowRight, HiStar, HiShieldCheck, HiUsers } from "react-icons/hi";
import { FaTwitter, FaGithub, FaDiscord } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

function Landings() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  
  const { user, logout } = useAuth();

  const languages = [
    { name: "English", flag: "🇺🇸", code: "en" },
    { name: "Spanish", flag: "🇪🇸", code: "es" },
    { name: "French", flag: "🇫🇷", code: "fr" },
    { name: "German", flag: "🇩🇪", code: "de" },
    { name: "Hindi", flag: "🇮🇳", code: "hi" },
    { name: "Japanese", flag: "🇯🇵", code: "ja" },
    { name: "Arabic", flag: "🇸🇦", code: "ar" },
    { name: "Chinese", flag: "🇨🇳", code: "zh" },
    { name: "Portuguese", flag: "🇵🇹", code: "pt" },
    { name: "Russian", flag: "🇷🇺", code: "ru" },
    { name: "Italian", flag: "🇮🇹", code: "it" },
    { name: "Korean", flag: "🇰🇷", code: "ko" }
  ];

  const features = [
    { icon: <HiSparkles />, title: "Natural AI Voices", desc: "Human-like voice synthesis with emotional tones" },
    { icon: <HiLightningBolt />, title: "Fast Conversion", desc: "Process 1-hour videos in under 5 minutes" },
    { icon: <HiMicrophone />, title: "Perfect Lip Sync", desc: "AI-powered lip movement synchronization" },
    { icon: <HiGlobe />, title: "120+ Languages", desc: "Global reach with extensive language support" },
    { icon: <HiCheck />, title: "Easy to Use", desc: "No technical skills required" },
    { icon: <HiDeviceMobile />, title: "Multi-Platform", desc: "Works on all devices and platforms" }
  ];

  const steps = [
    { number: "01", title: "Upload Video", desc: "Drag & drop your video file. Supports MP4, MOV, AVI up to 4K" },
    { number: "02", title: "Choose Language", desc: "Select target language from 120+ options with voice styles" },
    { number: "03", title: "AI Processing", desc: "Our AI translates, dubs, and syncs lips automatically" },
    { number: "04", title: "Download & Share", desc: "Get your multilingual video ready for global audiences" }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$19",
      period: "/month",
      description: "Perfect for individual creators",
      features: [
        "Up to 10 videos per month",
        "3 languages included",
        "720p resolution",
        "Basic lip sync",
        "Community support",
        "Watermark on exports"
      ],
      cta: "Start Free Trial",
      popular: false,
      icon: <HiSparkles className="text-2xl" />
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description: "Best for professional creators",
      features: [
        "Up to 50 videos per month",
        "10 languages included",
        "1080p resolution",
        "Advanced lip sync",
        "Priority support",
        "No watermark",
        "Custom voice styles",
        "Batch processing"
      ],
      cta: "Get Started",
      popular: true,
      icon: <HiStar className="text-2xl" />
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For teams & organizations",
      features: [
        "Unlimited videos",
        "All 120+ languages",
        "4K resolution",
        "Perfect lip sync",
        "Dedicated support",
        "API access",
        "Custom integrations",
        "Team management",
        "SLA guarantee"
      ],
      cta: "Contact Sales",
      popular: false,
      icon: <HiUsers className="text-2xl" />
    }
  ];

  const faqs = [
    {
      question: "How accurate is the AI translation?",
      answer: "Our AI achieves 99.5% accuracy for most languages, with advanced neural networks ensuring natural-sounding translations."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes! All plans come with a 7-day free trial and you can cancel anytime with no hidden fees."
    },
    {
      question: "What video formats are supported?",
      answer: "We support MP4, MOV, AVI, WMV, and MKV formats up to 4K resolution and 2GB file size."
    },
    {
      question: "How long does processing take?",
      answer: "Typically 1-5 minutes for a 10-minute video, depending on the selected features and resolution."
    }
  ];

  return (
    <div className="bg-gradient-to-b from-[#0A0A14] via-[#0F0F1A] to-[#0A0A14] text-white overflow-x-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
            initial={{
              x: Math.random() * 100 + 'vw',
              y: Math.random() * 100 + 'vh'
            }}
            animate={{
              x: [null, Math.random() * 100 + 'vw'],
              y: [null, Math.random() * 100 + 'vh']
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* NAVBAR */}
      <motion.nav
        className="w-full py-4 px-6 md:px-12 flex justify-between items-center fixed top-0 z-50 backdrop-blur-lg bg-[#0A0A14]/80 border-b border-white/5"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <HiTranslate className="text-2xl" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            VideoLang AI
          </h2>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "Languages", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="relative group text-gray-300 hover:text-white transition-colors"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
          
          {/* Conditional rendering based on user login */}
          {user ? (
            <div className="flex items-center gap-4">
              <NavLink
                to="/dashboard"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </NavLink>
              <button
                onClick={logout}
                className="group relative px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 transition-all duration-300 hover:shadow-[0_0_40px_rgba(239,68,68,0.3)]"
              >
                <span className="flex items-center gap-2">
                  Logout
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          ) : (
            <NavLink
              to="/signup"
              className="group relative px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.3)]"
            >
              <span className="flex items-center gap-2">
                Try Free
                <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </NavLink>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-2xl p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          {isOpen ? <HiX /> : <HiMenu />}
        </button>

        {/* Mobile Menu */}
        <motion.div
          className={`absolute top-16 left-0 w-full bg-[#0A0A14]/95 backdrop-blur-xl border-b border-white/5 ${isOpen ? 'block' : 'hidden'}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col p-4 gap-3">
            {["Features", "How It Works", "Languages", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </a>
            ))}
            {/* Mobile auth links */}
            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className="py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </NavLink>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="py-3 px-4 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/signup"
                className="py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-center mt-2"
                onClick={() => setIsOpen(false)}
              >
                Try Free
              </NavLink>
            )}
          </div>
        </motion.div>
      </motion.nav>

      {/* HERO SECTION */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 relative">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 0, 360] }}
            transition={{ duration: 25, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm">No credit card required • 7-day free trial</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Translate Videos
            </span>
            <br />
            <span className="text-white">Like Magic</span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Transform any video into 120+ languages with perfect lip sync and natural AI voices.
            Reach billions of viewers worldwide.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            {/* Conditional CTA button */}
            {user ? (
              <NavLink
                to="/dashboard"
                className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:shadow-[0_0_60px_rgba(99,102,241,0.4)]"
              >
                <span className="flex items-center gap-3 text-lg font-semibold">
                  Go to Dashboard
                  <HiArrowRight className="group-hover:translate-x-2 transition-transform" />
                </span>
              </NavLink>
            ) : (
              <NavLink
                to="/signup"
                className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:shadow-[0_0_60px_rgba(99,102,241,0.4)]"
              >
                <span className="flex items-center gap-3 text-lg font-semibold">
                  Start Free Trial
                  <HiArrowRight className="group-hover:translate-x-2 transition-transform" />
                </span>
              </NavLink>
            )}
            <a
              href="#pricing"
              className="group flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 hover:bg-white/5 transition-colors"
            >
              <HiStar className="text-blue-400" />
              <span>View Pricing</span>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {["50K+ Creators", "120+ Languages", "99.5% Accuracy", "2M+ Videos"].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.split('+')[0]}
                  <span className="text-white">+</span>
                </div>
                <div className="text-gray-400 text-sm mt-1">{stat.split('+')[1] || stat.split(' ')[1]}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating Video Preview */}
        <motion.div
          className="absolute bottom-10 right-10 hidden lg:block"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="relative">
            <div className="w-48 h-32 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/10 backdrop-blur-sm p-1">
              <div className="w-full h-full rounded-xl bg-black/50 flex items-center justify-center">
                <HiPlay className="text-3xl text-white/50" />
              </div>
            </div>
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/30 to-cyan-500/30 border border-white/10 backdrop-blur-sm p-1">
              <div className="w-full h-full rounded-xl bg-black/50 flex items-center justify-center">
                <HiTranslate className="text-xl text-white/50" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 mb-4">
              <HiLightningBolt />
              <span className="text-sm font-medium">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Transform your videos in just 4 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="relative group"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="absolute -top-4 -left-4 text-5xl font-black text-white/5">
                  {step.number}
                </div>
                <div className="relative p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300 group-hover:scale-105">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                    <div className="text-2xl text-blue-400">
                      {i === 0 && "📤"}
                      {i === 1 && "🌐"}
                      {i === 2 && "⚡"}
                      {i === 3 && "🎬"}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-6 md:px-12 bg-gradient-to-b from-transparent to-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 mb-4">
              <HiSparkles />
              <span className="text-sm font-medium">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Creators Love</span> Us
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="group relative"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`p-8 rounded-3xl border transition-all duration-500 ${hoveredFeature === i ? 'border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-purple-500/10' : 'border-white/10 bg-white/5'}`}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-500 ${hoveredFeature === i ? 'bg-gradient-to-br from-blue-500 to-purple-500 scale-110' : 'bg-white/5'}`}>
                    <div className={`text-2xl ${hoveredFeature === i ? 'text-white' : 'text-blue-400'}`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                  {hoveredFeature === i && (
                    <motion.div
                      className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 -z-10"
                      layoutId="featureBg"
                      transition={{ type: "spring", bounce: 0.2 }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LANGUAGES SECTION */}
      <section id="languages" className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 mb-4">
              <HiGlobe />
              <span className="text-sm font-medium">Global Reach</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Support for <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">120+ Languages</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From major world languages to regional dialects
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
            {languages.map((lang, i) => (
              <motion.div
                key={i}
                className="group relative"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300 group-hover:scale-105 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <div className="font-semibold">{lang.name}</div>
                      <div className="text-sm text-gray-400">{lang.code.toUpperCase()}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <button className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
              View All 120+ Languages →
            </button>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 px-6 md:px-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-400 mb-4">
              <HiStar />
              <span className="text-sm font-medium">Simple Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Perfect Plan</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Start with a 7-day free trial. No credit card required.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10">
              <button className="px-6 py-2 rounded-full bg-blue-600 text-white font-medium">
                Monthly
              </button>
              <button className="px-6 py-2 rounded-full text-gray-400 hover:text-white transition-colors">
                Yearly (Save 20%)
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`relative group ${plan.popular ? 'md:-mt-4' : ''}`}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredPlan(index)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className={`h-full p-8 rounded-3xl border-2 transition-all duration-300 ${hoveredPlan === index ? 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.3)]' : plan.popular ? 'border-blue-500/50' : 'border-white/10'} ${plan.popular ? 'bg-gradient-to-b from-blue-500/5 to-purple-500/5' : 'bg-white/5'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-white/10'}`}>
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-bold">{plan.price}</span>
                      <span className="text-gray-400">{plan.period}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">Billed monthly</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <HiCheck className="text-green-500" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <NavLink
                    to={user ? "/dashboard" : "/signup"}
                    className={`block w-full py-3 rounded-xl font-semibold text-center transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                  >
                    {plan.cta}
                  </NavLink>

                  {plan.popular && (
                    <p className="text-center text-sm text-gray-400 mt-4">
                      <HiShieldCheck className="inline mr-2" />
                      30-day money-back guarantee
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            className="mt-24 max-w-3xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                  initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h4 className="font-semibold text-lg mb-2">{faq.question}</h4>
                  <p className="text-gray-400">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.4 }}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <HiSparkles className="text-4xl" />
              </div>
            </div>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            Ready to Reach a{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Global Audience?
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Join 50,000+ creators who've expanded their reach with VideoLang AI
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <NavLink
              to={user ? "/dashboard" : "/signup"}
              className="group relative px-10 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:shadow-[0_0_80px_rgba(99,102,241,0.5)] text-lg font-semibold"
            >
              <span className="flex items-center justify-center gap-3">
                {user ? "Go to Dashboard" : "Start Free Trial"}
                <HiArrowRight className="group-hover:translate-x-2 transition-transform" />
              </span>
            </NavLink>
            <a
              href="#pricing"
              className="px-10 py-4 rounded-full border border-white/20 hover:bg-white/5 transition-colors text-lg"
            >
              View Pricing
            </a>
          </motion.div>

          <motion.p
            className="text-gray-400 text-sm mt-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            No credit card required • Free 7-day trial • Cancel anytime
          </motion.p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 md:px-12 border-t border-white/5 bg-[#0A0A14]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <HiTranslate className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VideoLang AI
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                Making videos globally accessible with AI-powered translation and dubbing.
              </p>
              <div className="flex gap-4 mt-6">
                {[FaTwitter, FaGithub, FaDiscord].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <Icon className="text-gray-400 hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {["Product", "Company", "Resources", "Legal"].map((category, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-4">{category}</h4>
                <ul className="space-y-3">
                  {["Features", "How It Works", "Pricing", "Languages"].map((item, j) => (
                    <li key={j}>
                      <a
                        href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5 text-center text-gray-400 text-sm">
            <p>© 2025 VideoLang AI. All rights reserved.</p>
            <p className="mt-2">
              Made with ❤️ for creators worldwide
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landings;