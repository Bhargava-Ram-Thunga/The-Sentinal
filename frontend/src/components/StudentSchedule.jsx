import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loader from "./loader";
import toast from "react-hot-toast";

const StudentSchedule = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      const token = Cookies.get("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const studentId = payload.studentId;

        const res = await fetch(
          `http://127.0.0.1:5000/api/schedules/${studentId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await res.json();

        if (res.ok) {
          setSchedule(result.schedule);
        } else {
          toast.error(result.message || "Failed to fetch schedule.");
        }
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
        toast.error("Network error. Could not fetch schedule.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Loader />
        <p className="mt-4 text-gray-400">Fetching your schedule...</p>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="p-4 text-center animate-fade-in-slow">
        {/* <h2 className="mb-4 text-2xl font-bold text-gray-100 drop-shadow-lg">
          Student Schedule
        </h2> */}
        <p className="mb-6 text-gray-400 drop-shadow-sm">
          No schedule has been set for your section yet.
        </p>
      </div>
    );
  }

  const formatTimeDisplay = (timeStr) => {
    const [start, end] = timeStr.split(" - ");
    const endPeriod = end.split(" ")[1];
    let startPeriod = endPeriod;
    const startHour = parseInt(start.split(":")[0]);

    if (endPeriod === "PM" && startHour < 12) {
      startPeriod = "AM";
    }

    return `${start} ${startPeriod} - ${end}`;
  };

  const sortedScheduleEntries = Object.entries(schedule).sort(
    ([timeA], [timeB]) => {
      const parseSortTime = (timeStr) => {
        const parts = timeStr.match(/(\d+):(\d+)\s(AM|PM)/);
        if (!parts) return 0; // Fallback for incorrect format
        let [, hour, min, period] = parts;

        hour = parseInt(hour);
        min = parseInt(min);

        if (period === "PM" && hour !== 12) {
          hour += 12;
        }
        if (period === "AM" && hour === 12) {
          hour = 0;
        }
        return hour * 60 + min;
      };
      return parseSortTime(timeA) - parseSortTime(timeB);
    }
  );

  const now = new Date();

  const isPastClass = (timeSlot) => {
    const endPart = timeSlot.split(" - ")[1];
    const parts = endPart.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!parts) return false;
    let [, endHour, endMin, endPeriod] = parts;

    endHour = parseInt(endHour);
    endMin = parseInt(endMin);

    if (endPeriod === "PM" && endHour !== 12) {
      endHour += 12;
    }
    if (endPeriod === "AM" && endHour === 12) {
      endHour = 0;
    }

    const endTime = new Date();
    endTime.setHours(endHour, endMin, 0, 0);

    return now > endTime;
  };

  return (
    <div className="p-4 overflow-y-hidden h-fit animate-fade-in-slow">
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-200 uppercase bg-white/10">
            <tr>
              <th scope="col" className="px-6 py-3">
                Time
              </th>
              <th scope="col" className="px-6 py-3">
                Activity
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedScheduleEntries.map(([time, activity]) => (
              <tr
                key={time}
                className={`bg-transparent border-b border-gray-700/50 hover:bg-gray-800/20 transition-colors duration-200 ${
                  isPastClass(time) ? "text-gray-500 opacity-60" : ""
                }`}
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-white whitespace-nowrap"
                >
                  {formatTimeDisplay(time)}
                </th>
                <td className="px-6 py-4">{activity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentSchedule;
