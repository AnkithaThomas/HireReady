import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Amplify } from "aws-amplify";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import awsConfig from "./aws-exports";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import Dashboard from "./pages/Dashboard";
import PathwayView from "./pages/PathwayView";
import InterviewPage from "./pages/InterviewPage";

Amplify.configure(awsConfig);

export default function App() {
  const [user, setUser] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      const onboardedValue = localStorage.getItem(`onboarded_${currentUser.userId}`);
      setUser(currentUser);
      setIsOnboarded(onboardedValue === "true");
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut();
    setUser(null);
    setIsOnboarded(false);
  }

  function handleOnboardingComplete() {
    localStorage.setItem(`onboarded_${user.userId}`, "true");
    setIsOnboarded(true);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" /> : <LandingPage />}
      />
      <Route
        path="/auth"
        element={user ? <Navigate to="/dashboard" /> : <AuthPage onLogin={checkUser} />}
      />
      <Route
        path="/onboarding"
        element={
          !user ? <Navigate to="/auth" /> :
          isOnboarded ? <Navigate to="/dashboard" /> :
          <OnboardingPage user={user} onComplete={handleOnboardingComplete} />
        }
      />
      <Route
        path="/dashboard"
        element={
          !user ? <Navigate to="/auth" /> :
          !isOnboarded ? <Navigate to="/onboarding" /> :
          <Dashboard user={user} onLogout={handleLogout} />
        }
      />
      <Route
        path="/dashboard/:roadmapId"
        element={
          !user ? <Navigate to="/auth" /> :
          !isOnboarded ? <Navigate to="/onboarding" /> :
          <PathwayView user={user} onLogout={handleLogout} />
        }
      />
      <Route
        path="/interview"
        element={
          !user ? <Navigate to="/auth" /> :
          !isOnboarded ? <Navigate to="/onboarding" /> :
          <InterviewPage />
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
