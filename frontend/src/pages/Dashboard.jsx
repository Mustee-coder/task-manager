import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore.js";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TaskCard from "../components/TaskCard";

const API = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  const [recentTasks, setRecentTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const getToken = () => localStorage.getItem("token");

  // Fetch recent tasks
  const fetchRecentTasks = async () => {
    const token = getToken();

    if (!token) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch tasks");

      const tasks = [...(data.pending || []), ...(data.completed || [])];

      tasks.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setRecentTasks(tasks.slice(0, 5));
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin");
      return;
    }

    fetchRecentTasks();
  }, []);

  // DELETE TASK
  const handleDelete = async (id) => {
    const token = getToken();

    if (!token) {
      toast.error("Please login again");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API}/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete task");

      toast.success("Task deleted successfully!");

      setRecentTasks((prev) =>
        prev.filter((task) => task._id !== id)
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  // UPDATE TASK
  const handleUpdate = async (id) => {
    const token = getToken();

    if (!editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      const res = await fetch(`${API}/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      toast.success("Task updated!");

      setEditingTaskId(null);
      setEditTitle("");
      setEditDescription("");

      fetchRecentTasks();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // TOGGLE COMPLETE
  const toggleComplete = async (task) => {
    const token = getToken();

    if (!token) {
      toast.error("Please login again");
      navigate("/login");
      return;
    }

    try {
      const endpoint = task.completed ? "pending" : "complete";

      const res = await fetch(
        `${API}/api/tasks/${task._id}/${endpoint}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Toggle failed");

      fetchRecentTasks();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Navbar />

      <div className="p-6 text-center" data-theme={theme}>
        <h1 className="text-3xl font-bold mb-8">
          Welcome to Task Manager
        </h1>

        <div className="flex justify-center gap-6 mb-6">
          <Link
            to="/tasks"
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
          >
            Create New Task
          </Link>

          <Link
            to="/viewTasks"
            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
          >
            View All Tasks
          </Link>
        </div>

        <div className="max-w-3xl mx-auto mt-8 text-left">
          <h2 className="text-xl font-bold mb-4">
            Recent Tasks
          </h2>

          {recentTasks.length === 0 ? (
            <p className="text-gray-500">
              No recent tasks found.
            </p>
          ) : (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  editingTaskId={editingTaskId}
                  setEditingTaskId={setEditingTaskId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  editDescription={editDescription}
                  setEditDescription={setEditDescription}
                  handleUpdate={handleUpdate}
                  handleDelete={handleDelete}
                  toggleComplete={toggleComplete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;