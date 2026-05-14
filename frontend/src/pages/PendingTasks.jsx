import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_API_URL;

// create axios instance ONCE
const api = axios.create({
  baseURL: `${API}/api`,
});

// attach token ONCE
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const PendingTasks = () => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    try {
      const { data } = await api.get("/tasks");

      setTasks(data.pending || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch tasks"
      );
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const completeTask = async (id) => {
    try {
      await api.patch(`/tasks/${id}/complete`);

      toast.success("Task completed");
      fetchTasks();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to complete task"
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Pending Tasks ({tasks.length})
      </h1>

      {tasks.length === 0 ? (
        <p>No pending tasks</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="border p-4 rounded flex justify-between items-center shadow"
            >
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p>{task.description}</p>
              </div>

              <button
                onClick={() => completeTask(task._id)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Complete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingTasks;