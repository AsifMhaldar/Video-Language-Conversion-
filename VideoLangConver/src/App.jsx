// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import Landing from './Pages/Landings';     // Default import
import SignUp from './Pages/SignUp';        // Default import  
import SignIn from './Pages/SignIn';        // Default import
import Dashboard from './Pages/Dashboard';  // Default import
import VideoHistory from './Pages/VideoHistory';
import LanguageConverter from './Pages/LanguageConverter';  

function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/video-history" element={<VideoHistory />} />
          <Route path="/language-converter" element={<LanguageConverter />} />
        </Routes>
    </AuthProvider>
  );
}

export default App;