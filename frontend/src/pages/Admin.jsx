import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import TaskManagerLogo from "../components/TaskManagerLogo";
import ThemeSelector from "../components/ThemeSelector";

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");

  // 🔥 AXIOS INSTANCE
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
  });

  // 🔥 AUTO TOKEN ATTACHMENT (FIX LOGIN ISSUES)
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  const toggleSidebar = () =>
    setSidebarOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const resUsers = await api.get("/admin/users");
      const resTasks = await api.get("/admin/tasks");

      const users = resUsers.data;
      const tasks = resTasks.data;

      setTotalUsers(users.length);
      setTotalTasks(tasks.length);
      setCompletedTasks(
        tasks.filter((t) => t.completed).length
      );
      setPendingTasks(
        tasks.filter((t) => !t.completed).length
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load dashboard"
      );
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const chartData = [
    {
      name: "Completed",
      completed: completedTasks,
      pending: 0,
    },
    {
      name: "Pending",
      completed: 0,
      pending: pendingTasks,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-44 bg-white shadow-md flex flex-col p-6 transform transition-transform duration-300 z-50 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <h1 className="text-lg font-bold mb-4 text-green-500">
          Admin Panel
        </h1>

        <button
          className="mb-3 p-2 hover:bg-gray-100 rounded font-semibold"
          onClick={() => {
            navigate("/admin");
            setSidebarOpen(false);
          }}
        >
          Dashboard
        </button>

        <button
          className="mb-3 p-2 hover:bg-gray-100 rounded font-semibold"
          onClick={() => {
            navigate("/usermanagement");
            setSidebarOpen(false);
          }}
        >
          User Management
        </button>

        <button
          className="mb-3 p-2 hover:bg-gray-100 rounded font-semibold"
          onClick={() => {
            navigate("/dashboard");
            setSidebarOpen(false);
          }}
        >
          User Dashboard
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-auto">

        {/* Navbar */}
        <nav className="bg-white px-4 py-3 flex justify-between items-center shadow-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="w-9 h-9 rounded bg-blue-500 text-white"
            >
              ☰
            </button>

            <TaskManagerLogo />
          </div>

          <div className="flex items-center gap-4">
            <ThemeSelector />

            <div className="relative group">
              <button className="w-9 h-9 rounded-full bg-blue-500 text-white">
                👤
              </button>

              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-2 hidden group-hover:block">
                <p className="px-3 py-2 text-sm text-gray-500">
                  {role}
                </p>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-500 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="p-6 md:p-8 lg:p-12">

          <h1 className="text-3xl font-bold mb-8 text-center">
            Admin Dashboard
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">

            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h2 className="text-3xl font-bold text-blue-500">
                {totalUsers}
              </h2>
              <p>Total Users</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h2 className="text-3xl font-bold text-purple-500">
                {totalTasks}
              </h2>
              <p>Total Tasks</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h2 className="text-3xl font-bold text-green-500">
                {completedTasks}
              </h2>
              <p>Completed Tasks</p>
            </div>

            <div
              className="bg-white p-6 rounded-xl shadow text-center cursor-pointer"
              onClick={() =>
                navigate("/usermanagement")
              }
            >
              <h2 className="text-3xl">👤</h2>
              <p>User Management</p>
            </div>

          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Task Overview
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="completed" fill="#4ade80" />
                <Bar dataKey="pending" fill="#facc15" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Admin;