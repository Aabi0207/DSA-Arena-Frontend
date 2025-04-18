import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SheetPage from "./pages/SheetPage";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import "./App.css";
import SavedPage from "./pages/SavedPage";
import ProfilePage from "./pages/ProfilePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotePage from "./pages/NotePage";

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthLoaded(true);
    }, 100); 

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthLoaded) {
      const loader = document.getElementById("initial-loader");
      if (loader) {
        loader.classList.add("fade-out");
        setTimeout(() => {
          loader.remove();
        }, 500);
      }
    }
  }, [isAuthLoaded]);

  if (!isAuthLoaded) return null;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/sheet/3" : "/login"} />} />
        <Route path="/login" element={user ? <Navigate to="/sheet/3" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/sheet/3" /> : <RegisterPage />} />
        <Route path="/sheet/:sheetId" element={user ? <SheetPage /> : <Navigate to="/login" />} />
        <Route path="/saved" element={user ? <SavedPage /> : <Navigate to="/login" />} />
        <Route path="/leaderboard" element={user ? <LeaderboardPage /> : <Navigate to="/login" />} />
        <Route path="/profile/:username" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/notes/:topic_id" element={user ? <NotePage /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/sheet/3" />} />
      </Routes>
    </Router>
  );
};

export default App;
