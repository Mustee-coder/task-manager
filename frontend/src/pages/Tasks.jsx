import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";

const API = import.meta.env.VITE_API_URL;

// Axios instance (created once)
const axiosInstance = axios.create({
  baseURL: `${API}/api`,
});

// Attach token once
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const Tasks = () => {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(false);

  const editInputRef = useRef(null);

  const getToken = () => localStorage.getItem("token");

  // FETCH TASKS
  const fetchTasks = async () => {
    const token = getToken();

    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.get("/tasks");

      setPendingTasks(res.data.pending || []);
      setCompletedTasks(res.data.completed || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTaskId]);

  // CREATE TASK
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post("/tasks", {
        title,
        description,
      });

      toast.success("Task created");
      setPendingTasks((prev) => [...prev, res.data.task]);
      setTitle("");
      setDescription("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  };

  // DELETE TASK
  const handleDelete = async (task) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await axiosInstance.delete(`/tasks/${task._id}`);

      toast.success("Task deleted");

      if (task.completed) {
        setCompletedTasks((prev) =>
          prev.filter((t) => t._id !== task._id)
        );
      } else {
        setPendingTasks((prev) =>
          prev.filter((t) => t._id !== task._id)
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  // UPDATE TASK
  const handleUpdate = async (task) => {
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      await axiosInstance.put(`/tasks/${task._id}`, {
        title: editTitle,
        description: editDescription,
      });

      toast.success("Task updated");
      setEditingTaskId(null);

      const update = (list) =>
        list.map((t) =>
          t._id === task._id
            ? { ...t, title: editTitle, description: editDescription }
            : t
        );

      task.completed
        ? setCompletedTasks(update)
        : setPendingTasks(update);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  // TOGGLE COMPLETE
  const toggleComplete = async (task) => {
    try {
      const endpoint = task.completed ? "pending" : "complete";

      await axiosInstance.patch(
        `/tasks/${task._id}/${endpoint}`
      );

      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Toggle failed");
    }
  };

  // FILTERED TASKS (optimized)
  const tasksToShow = useMemo(() => {
    const list =
      activeTab === "pending" ? pendingTasks : completedTasks;

    return list.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeTab, pendingTasks, completedTasks, search]);

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto mt-10">

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">

            <h1 className="text-2xl font-bold mb-4">
              Task Manager
            </h1>

            {/* Create */}
            <form onSubmit={handleCreate} className="space-y-3 mb-6">
              <input
                type="text"
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
              />

              <textarea
                className="textarea textarea-bordered w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                required
              />

              <button className="btn btn-success w-full">
                Create Task
              </button>
            </form>

            {/* Search */}
            <input
              className="input input-bordered w-full mb-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
            />

            {/* Tabs */}
            <div className="tabs tabs-boxed mb-4">
              <button
                className={`tab ${
                  activeTab === "pending" ? "tab-active" : ""
                }`}
                onClick={() => setActiveTab("pending")}
              >
                Pending ({pendingTasks.length})
              </button>

              <button
                className={`tab ${
                  activeTab === "completed" ? "tab-active" : ""
                }`}
                onClick={() => setActiveTab("completed")}
              >
                Completed ({completedTasks.length})
              </button>
            </div>

            {/* Tasks */}
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : (
              <div className="space-y-4">
                {tasksToShow.length === 0 && (
                  <p className="text-gray-500">
                    No tasks available
                  </p>
                )}

                {tasksToShow.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    editingTaskId={editingTaskId}
                    setEditingTaskId={setEditingTaskId}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    editDescription={editDescription}
                    setEditDescription={setEditDescription}
                    handleUpdate={() => handleUpdate(task)}
                    handleDelete={() => handleDelete(task)}
                    toggleComplete={() => toggleComplete(task)}
                    editInputRef={editInputRef}
                  />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default Tasks;