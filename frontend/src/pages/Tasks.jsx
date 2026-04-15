import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";

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

  // 🔥 CLEAN AXIOS INSTANCE (NO STATIC TOKEN)
  const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
  });

  // 🔥 ADD INTERCEPTOR (AUTO TOKEN ATTACH)
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  // Fetch tasks
  const fetchTasks = async () => {
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

  // Auto-focus edit input
  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTaskId]);

  // Create task
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post("/tasks", {
        title,
        description,
      });

      toast.success("Task created");
      setPendingTasks([...pendingTasks, res.data.task]);
      setTitle("");
      setDescription("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  };

  // Delete task
  const handleDelete = async (task) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await axiosInstance.delete(`/tasks/${task._id}`);
      toast.success("Task deleted");

      if (task.completed) {
        setCompletedTasks(completedTasks.filter((t) => t._id !== task._id));
      } else {
        setPendingTasks(pendingTasks.filter((t) => t._id !== task._id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  // Update task
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

      const updatedTask = {
        ...task,
        title: editTitle,
        description: editDescription,
      };

      if (task.completed) {
        setCompletedTasks(
          completedTasks.map((t) =>
            t._id === task._id ? updatedTask : t
          )
        );
      } else {
        setPendingTasks(
          pendingTasks.map((t) =>
            t._id === task._id ? updatedTask : t
          )
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  // Toggle complete
  const toggleComplete = async (task) => {
    try {
      const endpoint = task.completed ? "pending" : "complete";

      await axiosInstance.patch(
        `/tasks/${task._id}/${endpoint}`
      );

      if (task.completed) {
        setCompletedTasks(
          completedTasks.filter((t) => t._id !== task._id)
        );
        setPendingTasks([
          ...pendingTasks,
          { ...task, completed: false },
        ]);
      } else {
        setPendingTasks(
          pendingTasks.filter((t) => t._id !== task._id)
        );
        setCompletedTasks([
          ...completedTasks,
          { ...task, completed: true },
        ]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Toggle failed");
    }
  };

  // Filter tasks
  const tasksToShow =
    activeTab === "pending"
      ? pendingTasks.filter((t) =>
          t.title.toLowerCase().includes(search.toLowerCase())
        )
      : completedTasks.filter((t) =>
          t.title.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto mt-10">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h1 className="text-2xl font-bold mb-4">
              Task Manager
            </h1>

            {/* Create Task */}
            <form onSubmit={handleCreate} className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="Task title"
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <textarea
                placeholder="Task description"
                className="textarea textarea-bordered w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <button className="btn btn-success w-full">
                Create Task
              </button>
            </form>

            {/* Search */}
            <input
              type="text"
              placeholder="Search tasks..."
              className="input input-bordered w-full mb-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

            {/* Task List */}
            {loading ? (
              <p className="text-center text-gray-500">
                Loading tasks...
              </p>
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