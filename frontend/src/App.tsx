import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { NavBar } from './components/common/NavBar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { FeedPage } from './pages/FeedPage';
import { NearbyPage } from './pages/NearbyPage';
import { StyleguidePage } from './pages/StyleguidePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { NewListingPage } from './pages/NewListingPage';
import { MyListingsPage } from './pages/MyListingsPage';
import { ItemDetailPage } from './pages/ItemDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex min-h-screen flex-col bg-ivory text-earth">
            <NavBar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<FeedPage />} />
                <Route path="/styleguide" element={<StyleguidePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/nearby" element={<NearbyPage />} />
                <Route path="/artist-posts" element={<HomePage />} />
                <Route
                  path="/items/new"
                  element={
                    <ProtectedRoute>
                      <NewListingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/items/me"
                  element={
                    <ProtectedRoute>
                      <MyListingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/items/:id" element={<ItemDetailPage />} />
                <Route path="/inbox" element={<HomePage />} />
                <Route path="/notifications" element={<HomePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <footer className="border-t border-beige-200 bg-ivory/80 py-6 text-center text-caption text-stone-400 backdrop-blur-sm">
              <p>Reuse Marketplace · Desktop-first sustainable exchange · Wabi-Sabi aesthetic</p>
            </footer>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
