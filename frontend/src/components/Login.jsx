import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    // Admin login check
    if (data.studentId === "admin" && data.password === "admin") {
      // You might want to set a specific admin token or session here
      // For this example, we'll just navigate
      navigate("/admin");
      toast.success("Admin login successful!");
      return;
    }

    const loginPromise = fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      const res = await response.json();
      if (!response.ok) {
        throw new Error(
          res.message || "Login failed. Please check your credentials."
        );
      }
      return res;
    });

    toast.promise(loginPromise, {
      loading: "Logging in...",
      success: (res) => {
        Cookies.set("auth_token", res.token);
        navigate("/dashboard");
        return "Login successful!";
      },
      error: (err) => err.message,
    });
  };

  return (
    <div className="relative flex items-center justify-center w-full min-h-screen p-4">
      <div className="absolute bg-green-500 rounded-full top-1/4 left-1/4 w-96 h-96 mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bg-teal-500 rounded-full top-1/2 right-1/4 w-80 h-80 mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute rounded-full bottom-1/4 left-1/2 w-72 h-72 bg-cyan-500 mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative w-sm max-w-sm sm:max-w-md p-8 rounded-2xl shadow-2xl bg-white/5 backdrop-blur-3xl border border-white/10 transform transition-all duration-500 group hover:scale-[1.005] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] focus-within:scale-[1.005] focus-within:shadow-[0_0_25px_rgba(16,185,129,0.3)] flex flex-col justify-center overflow-auto max-h-full">
        <h2 className="mb-4 text-2xl font-extrabold text-center text-gray-100 sm:text-3xl md:text-4xl drop-shadow-lg animate-fade-in-slow">
          Student Login
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              Password
            </label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="mt-1 block w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none transition-all duration-300 placeholder-white/50 text-white"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-300 animate-fade-in">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full relative py-3 px-6 text-white font-bold rounded-lg overflow-hidden bg-green-500/70 shadow-lg transition-all duration-500 hover:scale-101 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer"
          >
            <span className="absolute inset-0 transition-opacity duration-500 bg-green-500 opacity-0 group-hover:opacity-100"></span>
            <span className="relative z-10">Login</span>
          </button>
        </form>
        <p className="mt-6 text-sm text-center text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-green-400 transition-colors hover:text-green-300"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;