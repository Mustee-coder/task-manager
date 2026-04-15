import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [isPending, setIsPending] = useState(false);
  const { name, email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Signup failed");
        return;
      }

      toast.success("Signup successful");

      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role || "user");

      setTimeout(() => navigate("/dashboard"), 1000);

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-white border border-gray-200 
                   rounded-lg shadow-md p-6 space-y-5"
      >

        {/* TITLE */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Task Manager Account
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Sign up to start managing your tasks
          </p>
        </div>

        {/* NAME */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 
                     rounded-md text-gray-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 
                     rounded-md text-gray-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 
                     rounded-md text-gray-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* BUTTON */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-md 
                     hover:bg-blue-700 transition 
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Creating account..." : "Create Account"}
        </button>

        {/* LOGIN LINK */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;