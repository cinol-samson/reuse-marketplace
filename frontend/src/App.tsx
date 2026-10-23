import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NavBar } from './components/common/NavBar';
import { HomePage } from './pages/HomePage';
import { StyleguidePage } from './pages/StyleguidePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-ivory text-earth">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/styleguide" element={<StyleguidePage />} />
            {/* Fallback routes for stage 1+ pages */}
            <Route path="/nearby" element={<HomePage />} />
            <Route path="/artist-posts" element={<HomePage />} />
            <Route path="/items/new" element={<HomePage />} />
            <Route path="/inbox" element={<HomePage />} />
            <Route path="/notifications" element={<HomePage />} />
            <Route path="/profile" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-beige-200 py-6 text-center text-caption text-stone-400">
          <p>Reuse Marketplace · Desktop-first sustainable exchange · Wabi-Sabi aesthetic</p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
