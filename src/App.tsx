import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import SearchPage from './pages/SearchPage';
import PipelinePage from './pages/PipelinePage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import MyStatsPage from './pages/MyStatsPage';
import LoadingSpinner from './components/common/LoadingSpinner';
import LoginManager from './components/auth/LoginManager';

function App() {
  const { isLoading } = useAuth();

  // By moving the conditional logic inside the main return,
  // the hook structure remains the same on every render, fixing the error.
  return (
    <Router>
      {isLoading ? (
        <div className="min-h-screen bg-background-primary flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-text-secondary">Initializing ReelHunter...</p>
          </div>
        </div>
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Navigate to="/search" replace />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/my-stats" element={<MyStatsPage />} />
          </Routes>
          <LoginManager />
        </>
      )}
    </Router>
  );
}

export default App;
