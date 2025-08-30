import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Loader from "./loader";
import { FaArrowLeft } from "react-icons/fa";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get("auth_token");
      if (!token) {
        setLoading(false);
        return navigate("/login");
      }
      try {
        const res = await fetch("http://127.0.0.1:5000/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();
        if (res.ok) {
          setUserData(result);
        } else {
          console.error("Failed to fetch profile:", result.message);
          navigate("/login");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    Cookies.remove("auth_token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="relative flex flex-col items-center w-full max-w-2xl p-12 text-center border shadow-2xl rounded-2xl bg-white/5 backdrop-blur-3xl border-white/10 animate-fade-in-slow">
          <Loader />
          <p className="mt-4 text-gray-400">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="relative flex flex-col items-center w-full max-w-2xl p-12 text-center border shadow-2xl rounded-2xl bg-white/5 backdrop-blur-3xl border-white/10 animate-fade-in-slow">
          <h2 className="text-2xl font-bold text-gray-100">
            Profile Not Found
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full p-4">
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute text-gray-400 transition-colors duration-300 cursor-pointer top-4 left-4 hover:text-white"
        aria-label="Go back to dashboard"
      >
        <FaArrowLeft size={22} />
      </button>
      <div className="relative w-full max-w-lg p-8 rounded-2xl shadow-2xl bg-white/5 backdrop-blur-3xl border border-white/10 transform transition-all duration-500 group hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] focus-within:scale-[1.01] focus-within:shadow-[0_0_25px_rgba(59,130,246,0.3)]">
        <h1 className="mb-8 text-4xl font-extrabold text-center text-gray-100 drop-shadow-lg animate-fade-in-slow">
          Student Profile
        </h1>
        <div className="flex flex-col items-center text-center animate-fade-in-slow">
          <p className="mb-2 text-lg text-gray-200">
            <span className="font-bold">Student ID:</span> {userData.studentId}
          </p>
          <p className="mb-2 text-lg text-gray-200">
            <span className="font-bold">Name:</span> {userData.name}
          </p>
          <p className="mb-6 text-lg text-gray-200">
            <span className="font-bold">Email:</span> {userData.email}
          </p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-white font-bold rounded-full overflow-hidden bg-red-500/70 shadow-lg transition-all duration-500 will-change-transform hover:scale-[1.05] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] cursor-pointer"
          >
            <span className="z-10">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
