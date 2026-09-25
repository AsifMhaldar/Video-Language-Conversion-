// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landings';     // Default import
import SignUp from './pages/SignUp';        // Default import
import SignIn from './pages/SignIn';        // Default import
import Dashboard from './pages/Dashboard';  // Default import
import VideoHistory from './pages/VideoHistory';
import LanguageConverter from './pages/LanguageConverter';  

function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/video-history" element={<VideoHistory />} />
          <Route path="/language-converter" element={<LanguageConverter />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    </AuthProvider>
  );
}

export default App;