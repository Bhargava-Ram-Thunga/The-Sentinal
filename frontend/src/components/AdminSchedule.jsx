import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import Loader from "./loader";
import Cookies from "js-cookie";

const sections = [
  "S1",
  "S2",
  "S3",
  "S4",
  "S5",
  "S6",
  "S7",
  "S8",
  "S9",
  "S10",
  "IB-1",
  "IB-2",
  "IB-3",
  "IB-4",
  "IB-5",
  "IB-6",
];

const AdminSchedule = () => {
  const [selectedSection, setSelectedSection] = useState(sections[0]);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchSchedule = async (section) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/admin/schedules?section=${section}`
      );
      const data = await res.json();
      if (res.ok) {
        setSchedule(data.schedule || {});
        reset(data.schedule);
      } else {
        setSchedule({});
        reset({});
        toast.error(data.message || "No schedule found for this section.");
      }
    } catch (error) {
      toast.error("Network error. Could not fetch schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(selectedSection);
  }, [selectedSection]);

  const handleSaveSchedule = async (data) => {
    setLoading(true);
    const token = Cookies.get("auth_token");
    try {
      const res = await fetch("http://127.0.0.1:5000/api/admin/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // This is a placeholder for actual admin token
        },
        body: JSON.stringify({
          section: selectedSection,
          schedule: data,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed to save schedule.");
      }
    } catch (error) {
      toast.error("Network error. Could not save schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 text-center bg-transparent animate-fade-in-slow">
      <h2 className="mb-4 text-2xl font-bold text-gray-100 drop-shadow-lg">
        Admin Schedule Management
      </h2>
      <div className="flex flex-col items-center justify-center mb-6 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="block w-full px-3 py-2 text-sm text-white border rounded-lg sm:w-auto bg-white/10 border-white/20"
        >
          {sections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-4">
          <Loader />
          <p className="mt-4 text-gray-400">Loading schedule...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleSaveSchedule)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.keys(schedule).length > 0 ? (
              Object.keys(schedule).map((timeSlot) => (
                <div key={timeSlot}>
                  <label className="block text-sm font-medium text-gray-200">
                    {timeSlot}
                  </label>
                  <input
                    type="text"
                    {...register(timeSlot, {
                      required: "Activity is required",
                    })}
                    className="mt-1 block w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none text-white"
                  />
                </div>
              ))
            ) : (
              // Use a default structure if no schedule is found
              <>
                <p className="text-center text-gray-400 col-span-full">
                  No schedule found for this section. Please create one.
                </p>
                {Object.keys({
                  "8:30 - 9:30 AM": "",
                  "9:30 - 10:30 AM": "",
                  "10:30 - 11:30 AM": "",
                  "11:30 - 12:30 PM": "",
                  "12:30 - 1:30 PM": "Lunch Break",
                  "1:30 - 2:30 PM": "",
                  "2:30 - 3:30 PM": "",
                  "3:30 - 4:30 PM": "",
                }).map((timeSlot) => (
                  <div key={timeSlot}>
                    <label className="block text-sm font-medium text-gray-200">
                      {timeSlot}
                    </label>
                    <input
                      type="text"
                      {...register(timeSlot, {
                        required: "Activity is required",
                      })}
                      defaultValue={
                        timeSlot === "12:30 - 1:30 PM" ? "Lunch Break" : ""
                      }
                      className="mt-1 block w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none text-white"
                    />
                  </div>
                ))}
              </>
            )}
          </div>
          <button
            type="submit"
            className="relative w-full px-6 py-3 overflow-hidden font-bold text-white transition-all duration-500 rounded-lg shadow-lg cursor-pointer bg-green-500/70 hover:scale-101"
          >
            <span className="relative z-10">Save Schedule</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminSchedule;
