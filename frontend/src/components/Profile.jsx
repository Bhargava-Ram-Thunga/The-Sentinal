import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Loader from "./loader";
import { FaArrowLeft, FaEdit, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";

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
  "S11",
  "S12",
  "S13",
  "S14",
  "IB-1",
  "IB-2",
  "IB-3",
  "IB-4",
  "IB-5",
  "IB-6",
];

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm();
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm();
  const newPassword = watch("newPassword");

  const fetchProfile = async () => {
    const token = Cookies.get("auth_token");
    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
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
        resetProfile(result); // Set default values for the edit form
      } else {
        toast.error("Failed to fetch profile.");
        navigate("/login");
      }
    } catch (error) {
      toast.error("Network error. Could not fetch profile.");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (data) => {
    const token = Cookies.get("auth_token");
    const updatePromise = fetch("http://127.0.0.1:5000/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then(async (res) => {
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to update profile.");
      }
      return result;
    });

    toast.promise(updatePromise, {
      loading: "Updating profile...",
      success: (res) => {
        setIsEditing(false);
        fetchProfile(); // Re-fetch data to update UI
        return res.message;
      },
      error: (err) => err.message,
    });
  };

  const handleChangePassword = async (data) => {
    const token = Cookies.get("auth_token");
    const passwordPromise = fetch("http://127.0.0.1:5000/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }),
    }).then(async (res) => {
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to change password.");
      }
      return result;
    });

    toast.promise(passwordPromise, {
      loading: "Changing password...",
      success: (res) => {
        setIsChangingPassword(false);
        resetPassword();
        return res.message;
      },
      error: (err) => err.message,
    });
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
    <div className="flex flex-col w-screen min-h-screen p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg mx-auto p-8 rounded-2xl shadow-2xl bg-white/5 backdrop-blur-3xl border border-white/10 transform transition-all duration-500 group hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] focus-within:scale-[1.01] focus-within:shadow-[0_0_25px_rgba(59,130,246,0.3)] my-20">
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute text-gray-400 transition-colors duration-300 cursor-pointer top-4 left-4 hover:text-white"
          aria-label="Go back to dashboard"
        >
          <FaArrowLeft size={22} />
        </button>
        <div className="flex flex-col items-center text-center animate-fade-in-slow">
          <h1 className="mb-8 text-4xl font-extrabold text-gray-100 drop-shadow-lg">
            Student Profile
          </h1>
          <p className="mb-2 text-lg text-gray-200">
            <span className="font-bold">Student ID:</span> {userData.studentId}
          </p>
          <p className="mb-2 text-lg text-gray-200">
            <span className="font-bold">Name:</span> {userData.name}
          </p>
          <p className="mb-2 text-lg text-gray-200">
            <span className="font-bold">Email:</span> {userData.email}
          </p>
          <p className="mb-6 text-lg text-gray-200">
            <span className="font-bold">Section:</span>{" "}
            {userData.section || "Not specified"}
          </p>

          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setIsChangingPassword(false);
              }}
              className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-white font-bold rounded-full bg-blue-500/70 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer"
            >
              <FaEdit />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => {
                setIsChangingPassword(!isChangingPassword);
                setIsEditing(false);
              }}
              className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-white font-bold rounded-full bg-yellow-500/70 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] cursor-pointer"
            >
              <FaLock />
              <span>Change Password</span>
            </button>
          </div>

          {isEditing && (
            <form
              onSubmit={handleProfileSubmit(handleUpdateProfile)}
              className="w-full max-w-sm mt-8"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200">
                    Name
                  </label>
                  <input
                    type="text"
                    {...registerProfile("name", {
                      required: "Name is required",
                    })}
                    className="mt-1 block w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none transition-all duration-300 placeholder-white/50 text-white"
                  />
                  {profileErrors.name && (
                    <p className="mt-1 text-xs text-red-300">
                      {profileErrors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">
                    Email
                  </label>
                  <input
                    type="email"
                    {...registerProfile("email", {
                      required: "Email is required",
                      pattern: /^\S+@\S+$/i,
                    })}
                    className="mt-1 block w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none transition-all duration-300 placeholder-white/50 text-white"
                  />
                  {profileErrors.email && (
                    <p className="mt-1 text-xs text-red-300">
                      {profileErrors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">
                    Section
                  </label>
                  <select
                    {...registerProfile("section")}
                    className="mt-1 block w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none transition-all duration-300 placeholder-white/50 text-white"
                  >
                    <option value="">Select a section</option>
                    {sections.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full relative py-3 px-6 text-white font-bold rounded-lg overflow-hidden bg-green-500/70 shadow-lg transition-all duration-500 hover:scale-101 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {isChangingPassword && (
            <form
              onSubmit={handlePasswordSubmit(handleChangePassword)}
              className="w-full max-w-sm mt-8"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200">
                    Old Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword("oldPassword", {
                      required: "Old password is required",
                    })}
                    className="mt-1 block w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none transition-all duration-300 placeholder-white/50 text-white"
                  />
                  {passwordErrors.oldPassword && (
                    <p className="mt-1 text-xs text-red-300">
                      {passwordErrors.oldPassword.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">
                    New Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className="mt-1 block w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none transition-all duration-300 placeholder-white/50 text-white"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-xs text-red-300">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword("confirmPassword", {
                      required: "Please confirm your new password",
                      validate: (value) =>
                        value === newPassword || "Passwords do not match",
                    })}
                    className="mt-1 block w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none transition-all duration-300 placeholder-white/50 text-white"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-300">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full relative py-3 px-6 text-white font-bold rounded-lg overflow-hidden bg-green-500/70 shadow-lg transition-all duration-500 hover:scale-101 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer"
                >
                  Change Password
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-white font-bold rounded-full overflow-hidden bg-red-500/70 shadow-lg transition-all duration-300 will-change-transform hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] cursor-pointer"
            >
              <span className="z-10">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
