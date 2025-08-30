import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const navigate = useNavigate();

  const password = watch("password");

  const onSubmit = async (data) => {
    const registrationPromise = fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then(async (res) => {
      const result = await res.json();
      if (!res.ok) {
        throw new Error(
          result.message || "Registration failed. Please try again."
        );
      }
      return result;
    });

    toast.promise(registrationPromise, {
      loading: "Registering...",
      success: (result) => {
        navigate("/login");
        return "Registration successful! Please log in.";
      },
      error: (err) => err.message,
    });
  };

  return (
    <div className="relative flex items-center justify-center w-full min-h-screen p-4">
      <div className="absolute bg-purple-500 rounded-full top-1/4 left-1/4 w-96 h-96 mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bg-blue-500 rounded-full top-1/2 right-1/4 w-80 h-80 mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bg-pink-500 rounded-full bottom-1/4 left-1/2 w-72 h-72 mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative w-md max-w-sm sm:max-w-md md:max-w-lg p-4 sm:p-8 rounded-2xl shadow-2xl bg-white/5 backdrop-blur-3xl border border-white/10 transform transition-all duration-500 group hover:scale-[1.005] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] focus-within:scale-[1.005] focus-within:shadow-[0_0_25px_rgba(59,130,246,0.3)] flex flex-col justify-center overflow-auto max-h-full">
        <h2 className="mb-4 text-2xl font-extrabold text-center text-gray-100 sm:text-3xl md:text-4xl drop-shadow-lg animate-fade-in-slow">
          Student Registration
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-200 drop-shadow-sm">
              Student ID
            </label>
            <input
              type="text"
              {...register("studentId", { required: "Student ID is required" })}
              className="mt-1 block w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none transition-all duration-300 placeholder-white/50 text-white"
              placeholder="Your ID"
            />
            {errors.studentId && (
              <p className="mt-1 text-xs text-red-300 animate-fade-in">
                {errors.studentId.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 drop-shadow-sm">
              Name
            </label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="mt-1 block w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none transition-all duration-300 placeholder-white/50 text-white"
              placeholder="Your Full Name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-300 animate-fade-in">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 drop-shadow-sm">
              Email
            </label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: /^\S+@\S+$/i,
              })}
              className="mt-1 block w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none transition-all duration-300 placeholder-white/50 text-white"
              placeholder="you@college.edu"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-300 animate-fade-in">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 drop-shadow-sm">
              Password
            </label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="mt-1 block w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none transition-all duration-300 placeholder-white/50 text-white"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-300 animate-fade-in">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 drop-shadow-sm">
              Confirm Password
            </label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Confirm Password is required",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className="mt-1 block w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none transition-all duration-300 placeholder-white/50 text-white"
              placeholder="Re-enter your password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-300 animate-fade-in">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full relative py-3 px-6 text-white font-bold rounded-lg overflow-hidden bg-blue-500/70 shadow-lg transition-all duration-500 hover:scale-101 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] cursor-pointer"
          >
            <span className="absolute inset-0 transition-opacity duration-500 bg-blue-500 opacity-0 group-hover:opacity-100"></span>
            <span className="relative z-10">Register</span>
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-400 transition-colors hover:text-blue-300"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;