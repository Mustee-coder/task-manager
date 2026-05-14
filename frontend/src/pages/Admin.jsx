import { useState, useEffect, useMemo } from "react";
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

const API = import.meta.env.VITE_API_URL;

// Axios instance (created once)
const api = axios.create({
  baseURL: `${API}/api`,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);

  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const fetchStats = async () => {
    try {
      const [usersRes, tasksRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/tasks"),
      ]);

      const users = usersRes?.data || [];
      const tasks = tasksRes?.data || [];

      setTotalUsers(users.length);
      setTotalTasks(tasks.length);
      setCompletedTasks(tasks.filter((t) => t.completed).length);
      setPendingTasks(tasks.filter((t) => !t.completed).length);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load dashboard"
      );
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const chartData = useMemo(
    () => [
      {
        name: "Tasks",
        completed: completedTasks,
        pending: pendingTasks,
      },
    ],
    [completedTasks, pendingTasks]
  );

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-44 bg-white shadow-md p-6 transform transition-transform z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h1 className="text-lg font-bold mb-4 text-green-500">
          Admin Panel
        </h1>

        <button onClick={() => navigate("/admin")} className="mb-3 p-2">
          Dashboard
        </button>

        <button onClick={() => navigate("/usermanagement")} className="mb-3 p-2">
          User Management
        </button>

        <button onClick={() => navigate("/dashboard")} className="mb-3 p-2">
          User Dashboard
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-auto">

        {/* Navbar */}
        <nav className="bg-white px-4 py-3 flex justify-between shadow-md">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="w-9 h-9 bg-blue-500 text-white rounded"
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

              <div className="absolute right-0 hidden group-hover:block bg-white shadow-lg p-2 rounded">
                <p className="text-sm text-gray-500">{role}</p>
                <button onClick={handleLogout} className="text-red-500">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="p-6">

          <h1 className="text-3xl font-bold text-center mb-8">
            Admin Dashboard
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">

            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h2 className="text-3xl text-blue-500 font-bold">
                {totalUsers}
              </h2>
              <p>Total Users</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h2 className="text-3xl text-purple-500 font-bold">
                {totalTasks}
              </h2>
              <p>Total Tasks</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h2 className="text-3xl text-green-500 font-bold">
                {completedTasks}
              </h2>
              <p>Completed Tasks</p>
            </div>

            <div
              className="bg-white p-6 rounded-xl shadow text-center cursor-pointer"
              onClick={() => navigate("/usermanagement")}
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