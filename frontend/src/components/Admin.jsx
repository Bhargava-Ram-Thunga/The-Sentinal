import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Loader from "./loader";
import { FaCopy, FaHistory, FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import AdminSchedule from "./AdminSchedule";

const Admin = () => {
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const navigate = useNavigate();

  const lightRef = useRef(null);

  // Dynamic background effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (lightRef.current) {
        // Use pageX and pageY to account for scrolling
        lightRef.current.style.background = `radial-gradient(
          600px at ${e.pageX}px ${e.pageY}px,
          rgba(0, 255, 0, 0.2),
          transparent 90%
        )`;
      }
    };

    if (document.body) {
      document.body.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (document.body) {
        document.body.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  useEffect(() => {
    const fetchTodayAttendance = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:5000/api/attendance/today");
        const data = await res.json();
        if (res.ok) {
          setTodayAttendance(data.students || []);
        } else {
          toast.error(data.message || "Failed to fetch today's attendance.");
        }
      } catch (error) {
        toast.error("Network error. Could not fetch attendance.");
      } finally {
        setLoading(false);
      }
    };
    if (!showHistory && !showSchedule) {
      fetchTodayAttendance();
    }
  }, [showHistory, showSchedule]);

  const fetchAttendanceHistory = async () => {
    setLoading(true);
    setShowHistory(true);
    setShowSchedule(false);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/attendance/history");
      const data = await res.json();
      if (res.ok) {
        setHistoryData(data.history || []);
      } else {
        toast.error(data.message || "Failed to fetch history.");
      }
    } catch (error) {
      toast.error("Network error. Could not fetch attendance history.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowSchedule = () => {
    setShowSchedule(true);
    setShowHistory(false);
  };

  const handleBack = () => {
    setShowHistory(false);
    setShowSchedule(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(`${text} copied!`);
  };

  const handleLogout = () => {
    Cookies.remove("auth_token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="relative flex flex-col items-center w-full max-w-2xl p-12 text-center border shadow-2xl rounded-2xl bg-white/5 backdrop-blur-3xl border-white/10 animate-fade-in-slow">
          <Loader />
          <p className="mt-4 text-gray-400">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center w-screen min-h-screen overflow-auto bg-gray-950">
      <div
        ref={lightRef}
        className="fixed inset-0 z-0 pointer-events-none"
      ></div>
      {/* Container for the sticky header and main content */}
      <div className="relative w-screen rounded-2xl animate-fade-in-slow">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 w-full p-4 rounded-b-lg backdrop-blur-md ">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-100 drop-shadow-lg ">
              Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="py-2 px-4 text-white font-bold rounded-full bg-red-600/70 shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] cursor-pointer"
            >
              Logout
            </button>
          </div>

          <div className="flex flex-wrap items-center space-x-2">
            {!showHistory && !showSchedule ? (
              <>
                <button
                  onClick={fetchAttendanceHistory}
                  className="flex items-center space-x-2 py-2 px-4 text-white font-bold rounded-full bg-green-500/70 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer"
                >
                  <FaHistory />
                  <span>Previous Attendance Records</span>
                </button>
                <button
                  onClick={handleShowSchedule}
                  className="flex items-center space-x-2 py-2 px-4 text-white font-bold rounded-full bg-yellow-500/70 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] cursor-pointer"
                >
                  <FaCalendarAlt />
                  <span>Manage Schedules</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 py-2 px-4 text-white font-bold rounded-full bg-green-500/70 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer"
              >
                <FaArrowLeft />
                <span>Back</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="p-8 m-4 border shadow-2xl rounded-2xl bg-white/5 backdrop-blur-3xl border-white/10">
          {showSchedule ? (
            <AdminSchedule />
          ) : !showHistory ? (
            <div className="">
              <h2 className="mb-4 text-2xl font-semibold text-gray-200">
                Today's Attendance
              </h2>
              {todayAttendance.length > 0 ? (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {todayAttendance.map((student) => (
                    <li
                      key={student.studentId}
                      className="flex items-center justify-between p-3 transition-all duration-300 rounded-lg shadow-md cursor-pointer bg-white/10 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      onClick={() => copyToClipboard(student.studentId)}
                    >
                      <span className="text-gray-200">
                        {student.name} ({student.studentId})
                      </span>
                      <FaCopy className="text-gray-400 hover:text-white" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-8 text-lg text-center text-gray-400">
                  No attendance has been marked today.
                </p>
              )}
            </div>
          ) : (
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-gray-200">
                Attendance History
              </h2>
              <div className="space-y-4">
                {historyData.length > 0 ? (
                  historyData.map((record) => (
                    <div
                      key={record.date}
                      className="p-4 rounded-lg shadow-md bg-white/10"
                    >
                      <h3 className="mb-2 text-lg font-bold text-gray-100">
                        Date: {record.date}
                      </h3>
                      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                        {record.students.map((student) => (
                          <li
                            key={student.studentId}
                            className="flex items-center justify-between p-2 transition-all duration-300 rounded-md cursor-pointer bg-white/5 hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                            onClick={() => copyToClipboard(student.studentId)}
                          >
                            <span className="text-gray-300">
                              {student.name} ({student.studentId})
                            </span>
                            <FaCopy className="text-gray-500 hover:text-white" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="mt-8 text-lg text-center text-gray-400">
                    No previous attendance records found.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
