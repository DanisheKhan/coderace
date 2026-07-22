import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QuestionsProvider } from './contexts/QuestionsContext';

// Pages
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import MySheetPage from './pages/MySheetPage';
import DashboardPage from './pages/DashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ComparePage from './pages/ComparePage';
import NotFoundPage from './pages/NotFoundPage';

// Layout
import Layout from './components/layout/Layout';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
      <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin"></div>
    </div>
    <p className="mt-4 text-zinc-400 font-medium animate-pulse">Initializing CodeRace...</p>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, profile, loading, profileLoading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists but has no profile, they must onboarding (unless they are already on the onboarding page)
  if (!profile && !profileLoading) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Anonymous Route Wrapper (for Login/Sign Up)
const AnonRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    if (!profile) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Onboarding Route Wrapper (requires login, but no profile yet)
const OnboardingRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public / Auth routes */}
      <Route
        path="/login"
        element={
          <AnonRoute>
            <LoginPage />
          </AnonRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <OnboardingPage />
          </OnboardingRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="sheet" element={<MySheetPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="compare" element={<ComparePage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <QuestionsProvider>
          <AppRoutes />
        </QuestionsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;