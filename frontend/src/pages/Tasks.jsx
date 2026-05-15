import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";

const API = import.meta.env.VITE_API_URL;

// Axios instance
const axiosInstance = axios.create({
  baseURL: `${API}/api`,
});

// Attach token
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

  // FETCH TASKS
  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.get("/tasks");

      setPendingTasks(res.data?.pending || []);
      setCompletedTasks(res.data?.completed || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Focus edit input
  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTaskId]);

  // CREATE TASK
  

const handleCreate = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    await axiosInstance.post("/tasks", { title, description });

    toast.success("Task created successfully 🎉");

    setTitle("");
    setDescription("");
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to create task");
  } finally {
    setLoading(false);
  }
};

  // DELETE TASK
  const handleDelete = async (task) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await axiosInstance.delete(`/tasks/${task._id}`);

      toast.success("Task deleted");

      if (task.completed) {
        setCompletedTasks((prev) => prev.filter((t) => t._id !== task._id));
      } else {
        setPendingTasks((prev) => prev.filter((t) => t._id !== task._id));
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

      const updateList = (list) =>
        list.map((t) =>
          t._id === task._id
            ? { ...t, title: editTitle, description: editDescription }
            : t
        );

      if (task.completed) {
        setCompletedTasks(updateList);
      } else {
        setPendingTasks(updateList);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  // TOGGLE COMPLETE
  const toggleComplete = async (task) => {
    try {
      const endpoint = task.completed ? "pending" : "complete";

      await axiosInstance.patch(`/tasks/${task._id}/${endpoint}`);

      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Toggle failed");
    }
  };

  // FILTER TASKS
  const tasksToShow = useMemo(() => {
    const list = activeTab === "pending" ? pendingTasks : completedTasks;

    return list.filter((t) =>
      (t.title || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [activeTab, pendingTasks, completedTasks, search]);

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto mt-10 px-4">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">

            <h1 className="text-2xl font-bold">Task Manager</h1>

            {/* CREATE TASK */}
            <form
  onSubmit={handleCreate}
  className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-md space-y-5"
>
  <h2 className="text-xl font-semibold text-gray-800">
    Create New Task
  </h2>

  {/* Title */}
  <div>
    <label className="block text-sm font-medium text-gray-600">
      Task Title
    </label>
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Enter task title..."
      required
      className="w-full mt-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
    />
  </div>

  {/* Description */}
  <div>
    <label className="block text-sm font-medium text-gray-600">
      Description
    </label>
    <textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      placeholder="Enter task description..."
      rows="3"
      required
      className="w-full mt-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
    />
  </div>

  {/* Button */}
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition disabled:opacity-60"
  >
    {loading ? "Creating..." : "Create Task"}
  </button>
</form>

            {/* SEARCH */}
            <input
              className="input input-bordered w-full mb-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
            />

            {/* TABS */}
            <div className="tabs tabs-boxed mb-4">
              <button
                className={`tab ${activeTab === "pending" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                Pending ({pendingTasks.length})
              </button>

              <button
                className={`tab ${activeTab === "completed" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("completed")}
              >
                Completed ({completedTasks.length})
              </button>
            </div>

            {/* TASK LIST */}
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : (
              <div className="space-y-4">
                {tasksToShow.length === 0 && (
                  <p className="text-gray-500">No tasks available</p>
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