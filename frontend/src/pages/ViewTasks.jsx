import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";

const ViewTasks = () => {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const token = localStorage.getItem("token");

  // 🔥 SAFE FETCH WRAPPER (fixes login/unauthorized issues)
  const fetchWithAuth = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.headers,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");

    return data;
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const data = await fetchWithAuth(
        "https://task-manager-q4g7.onrender.com/api/tasks"
      );

      setPendingTasks(data.pending || []);
      setCompletedTasks(data.completed || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Delete task
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await fetchWithAuth(
        `http://localhost:5000/api/tasks/${id}`,
        { method: "DELETE" }
      );

      toast.success("Task deleted");
      fetchTasks();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Update task
  const handleUpdate = async (id, updates) => {
    try {
      await fetchWithAuth(
        `http://localhost:5000/api/tasks/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(updates),
        }
      );

      toast.success("Task updated");
      setEditingTaskId(null);
      fetchTasks();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Toggle complete
  const toggleComplete = async (task) => {
    try {
      const endpoint = task.completed
        ? "pending"
        : "complete";

      await fetchWithAuth(
        `http://localhost:5000/api/tasks/${task._id}/${endpoint}`,
        { method: "PATCH" }
      );

      fetchTasks();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Filter tasks
  const filteredPending = pendingTasks.filter((task) =>
    task.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredCompleted = completedTasks.filter((task) =>
    task.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const tasksToShow =
    activeTab === "pending"
      ? filteredPending
      : filteredCompleted;

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto mt-10">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">

            <h1 className="text-2xl font-bold mb-4">
              All Tasks
            </h1>

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
                  activeTab === "pending"
                    ? "tab-active"
                    : ""
                }`}
                onClick={() => setActiveTab("pending")}
              >
                Pending ({pendingTasks.length})
              </button>

              <button
                className={`tab ${
                  activeTab === "completed"
                    ? "tab-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab("completed")
                }
              >
                Completed ({completedTasks.length})
              </button>
            </div>

            {/* Task list */}
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
                  setEditingTaskId={
                    setEditingTaskId
                  }
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  editDescription={
                    editDescription
                  }
                  setEditDescription={
                    setEditDescription
                  }
                  handleUpdate={handleUpdate}
                  handleDelete={handleDelete}
                  toggleComplete={toggleComplete}
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ViewTasks;
