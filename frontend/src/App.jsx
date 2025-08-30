import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Admin from "./components/Admin"; // Import the new Admin component
import Loader from "./components/loader";
import "./index.css";
import { Toaster } from "react-hot-toast";

const isTokenValid = () => {
  const token = Cookies.get("auth_token");
  if (!token) {
    return false;
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 > Date.now()) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
};

const ProtectedRoute = ({ children }) => {
  return isTokenValid() ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  return isTokenValid() ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  const lightRef = useRef(null);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 500);

    const handleMouseMove = (e) => {
      if (lightRef.current) {
        lightRef.current.style.background = `radial-gradient(
          600px at ${e.clientX}px ${e.clientY}px,
          rgba(59, 130, 246, 0.3),
          transparent 80%
        )`;
      }
    };

    if (document.body) {
      document.body.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      clearTimeout(timer);
      if (document.body) {
        document.body.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  if (appLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen text-white bg-gray-950">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col w-screen h-screen overflow-hidden font-sans text-white bg-gray-950">
      <div
        ref={lightRef}
        className="absolute inset-0 z-0 pointer-events-none"
      ></div>
      <div className="absolute bg-purple-500 rounded-full top-1/4 left-1/4 w-96 h-96 mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bg-blue-500 rounded-full top-1/2 right-1/4 w-80 h-80 mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bg-pink-500 rounded-full bottom-1/4 left-1/2 w-72 h-72 mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <main className="relative z-10 flex items-center justify-center flex-1">
        <Routes>
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="*"
            element={
              <Navigate to={isTokenValid() ? "/dashboard" : "/login"} replace />
            }
          />
        </Routes>

        <Toaster />
      </main>
    </div>
  );
};

export default App;
