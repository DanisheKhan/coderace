import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QuestionsProvider } from './contexts/QuestionsContext';
import SmoothScroll from './components/SmoothScroll';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import MySheetPage from './pages/MySheetPage';
import DashboardPage from './pages/DashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ComparePage from './pages/ComparePage';
import AchievementsPage from './pages/AchievementsPage';
import NotFoundPage from './pages/NotFoundPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import AdminPage from './pages/AdminPage';
import TypingPage from './pages/TypingPage';
import JavaQuizPage from './pages/JavaQuizPage';
import CommunitiesPage from './pages/CommunitiesPage';

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

// Landing Route Wrapper (Shows Landing Page if logged out, redirects to /dashboard if logged in)
const LandingRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
};

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

  // Redirect to pending approval if user profile is not approved and they are not admin
  if (profile && !profile.approved && !profile.is_admin) {
    return <Navigate to="/pending-approval" replace />;
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

// Pending Approval Route Wrapper
const PendingApprovalRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }

  if (profile.approved || profile.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!profile.is_admin) {
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
      {/* Public Landing Page */}
      <Route path="/" element={<LandingRoute />} />
      <Route path="/landing" element={<LandingPage />} />

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
      <Route
        path="/pending-approval"
        element={
          <PendingApprovalRoute>
            <PendingApprovalPage />
          </PendingApprovalRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="sheet" element={<MySheetPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="communities" element={<CommunitiesPage />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="typing" element={<TypingPage />} />
        <Route path="quiz" element={<JavaQuizPage />} />
        <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <SmoothScroll>
        <AuthProvider>
          <QuestionsProvider>
            <AppRoutes />
          </QuestionsProvider>
        </AuthProvider>
      </SmoothScroll>
    </Router>
  );
}

export default App;