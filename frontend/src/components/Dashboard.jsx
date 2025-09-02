import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import FaceEnrollment from "./FaceEnrollment";
import MarkAttendance from "./MarkAttendance";
import Loader from "./loader";
import StudentSchedule from "./StudentSchedule";
import TodaysAttendanceMarked from "./TodaysAttendanceMarked";

const Dashboard = () => {
  const [hasFaceData, setHasFaceData] = useState(false);
  const [isTodaysAtMarked, setIsTodaysAtMarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Student Dashboard";
    const checkStatus = async () => {
      const token = Cookies.get("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const studentId = payload.studentId;

        // Check for face data first
        const faceDataRes = await fetch(
          `http://127.0.0.1:5000/check-face-data-presence/${studentId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const faceDataResult = await faceDataRes.json();
        setHasFaceData(faceDataResult.hasFaceData);
        // If face data exists, check for today's attendance
        if (faceDataResult.hasFaceData) {
          const attendanceRes = await fetch(
            `http://127.0.0.1:5000/is-todays-attendance-marked/${studentId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const attendanceResult = await attendanceRes.json();
          setIsTodaysAtMarked(attendanceResult.isAttendanceMarked);
        }
      } catch (error) {
        console.error("Failed to check status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  const handleLogout = () => {
    Cookies.remove("auth_token");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center w-full max-w-2xl p-12 text-center border shadow-2xl rounded-2xl bg-white/5 backdrop-blur-3xl border-white/10 animate-fade-in-slow">
          <Loader />
          <p className="mt-4 text-gray-400">
            Please wait a moment while we retrieve your data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4">
      {/* Header with Title and Profile/Logout Buttons */}
      <header className="flex items-center justify-between w-full p-4 mx-auto mb-4 border shadow-2xl bg-white/5 backdrop-blur-3xl rounded-2xl border-white/10 animate-fade-in-slow">
        <h1 className="text-4xl font-extrabold text-gray-100 drop-shadow-lg">
          Student Dashboard
        </h1>
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-2 group">
            {/* The Logout Button (Hidden by Default) */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-white font-bold rounded-full overflow-hidden bg-red-500/70 shadow-lg transition-all duration-500 transform -translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 cursor-pointer hover:scale-[1.05] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] will-change-transform"
            >
              <span className="z-10">Logout</span>
            </button>
            {/* The Circular Profile Button */}
            <Link
              to="/profile"
              className="flex items-center justify-center w-12 h-12 overflow-hidden font-bold text-white transition-all duration-300 transform rounded-full shadow-lg cursor-pointer bg-blue-500/10 backdrop-blur-md hover:scale-110"
            >
              <span className="z-10 text-xl">👤</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Sections (Two-Column Layout) */}
      <div className="flex flex-col flex-1 w-full mx-auto space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
        {/* Left Section: Student Schedule */}
        <div className="flex-1 p-4 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 transition-all duration-500 group hover:scale-[1.005] hover:shadow-[0_0_25px_rgba(253,230,138,0.2)]">
          <h2 className="m-2 text-2xl font-bold text-center text-gray-100 drop-shadow-lg">
            Student Schedule
          </h2>
          <StudentSchedule />
        </div>

        {/* Right Section: Face Data / Mark Attendance */}
        <div className="flex flex-col items-center flex-1 p-4 text-center lg:flex-none lg:w-96 rounded-2xl bg-white/5 backdrop-blur-3xl border-white/10 transition-all duration-500 group hover:scale-[1.005] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]">
          {hasFaceData ? (
            <div className="flex flex-col items-center justify-center flex-1 w-full">
              {isTodaysAtMarked ? (
                <TodaysAttendanceMarked />
              ) : (
                <MarkAttendance />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 w-full">
              {/* <h3 className="mb-4 text-xl font-bold text-gray-100 drop-shadow-lg">
                Add Face Data
              </h3> */}
              <FaceEnrollment />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
