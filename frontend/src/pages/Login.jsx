import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/users/login",
        formData
      );

     
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);

      
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.token}`;

      toast.success("Login successful");

      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 800);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white border border-gray-200 
                   rounded-lg shadow-md p-6 space-y-5"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Task Manager Login
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to manage your tasks
          </p>
        </div>

        <input
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="Email address"
          required
          className="w-full px-4 py-3 border border-gray-300 
                     rounded-md text-gray-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full px-4 py-3 border border-gray-300 
                       rounded-md text-gray-700 pr-10
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 
                       cursor-pointer text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-md 
                     hover:bg-blue-700 transition 
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;