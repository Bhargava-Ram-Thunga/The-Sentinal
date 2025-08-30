import React from "react";
import toast from "react-hot-toast";

const TodaysAttendanceMarked = () => {
  return (
    <div className="p-4 text-center bg-transparent animate-fade-in-slow">
      <h3 className="mb-4 text-2xl font-bold text-gray-100 drop-shadow-lg">
        Attendance Marked Today
      </h3>
      <p className="mb-6 text-gray-400 drop-shadow-sm">
        You have already marked your attendance for today. You're all set!
      </p>
    </div>
  );
};

export default TodaysAttendanceMarked;
