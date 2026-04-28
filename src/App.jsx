import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { getCurrentUser } from "aws-amplify/auth";
import awsConfig from "./aws-exports";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import Dashboard from "./pages/Dashboard";

Amplify.configure(awsConfig);

export default function App() {
  const [user, setUser] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsOnboarded(localStorage.getItem(`onboarded_${currentUser.userId}`) === "true");
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  if (!user && !showAuth) return <LandingPage onShowAuth={() => setShowAuth(true)} />;

  if (!user && showAuth) return <AuthPage onLogin={checkUser} />;
  
  if (!isOnboarded) return <OnboardingPage user={user} onComplete={() => {
    localStorage.setItem(`onboarded_${user.userId}`, "true");
    setIsOnboarded(true);
  }} />;

  return <Dashboard user={user} />;
}