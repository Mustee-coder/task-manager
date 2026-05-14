import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { Trash2, ShieldCheck, Lock, Unlock } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // 🔥 CLEAN AXIOS INSTANCE
  const api = axios.create({
    baseURL: "https://task-manager-q4g7.onrender.com/api",
  });

  // 🔥 AUTO ATTACH TOKEN (IMPORTANT FIX)
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  // Delete user
  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);

      setUsers(users.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message
      );
    }
  };

  // Promote user
  const promoteUser = async (id) => {
    try {
      await api.put(`/admin/promote/${id}`);

      setUsers(
        users.map((u) =>
          u._id === id ? { ...u, role: "admin" } : u
        )
      );

      toast.success("User promoted to admin");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message
      );
    }
  };

  // Block / Unblock user
  const toggleBlock = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/block`);

      setUsers(
        users.map((u) =>
          u._id === id
            ? { ...u, isBlocked: !u.isBlocked }
            : u
        )
      );

      toast.success("User status updated");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message
      );
    }
  };

  // Filter logic
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase()) ||
      user.email
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());

    const matchRole =
      roleFilter === "all" || user.role === roleFilter;

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !user.isBlocked) ||
      (statusFilter === "blocked" && user.isBlocked);

    return matchSearch && matchRole && matchStatus;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  const totalPages = Math.ceil(
    filteredUsers.length / usersPerPage
  );

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto">
        <div className="card bg-base-200 shadow-xl p-4">

          <h1 className="text-3xl font-bold mb-6 text-center">
            User Management
          </h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input input-bordered"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="select select-bordered"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            <select
              className="select select-bordered"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <p className="text-center text-gray-500 mb-3">
            Showing {filteredUsers.length} users
          </p>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {currentUsers.map((user, index) => (
                  <tr key={user._id}>
                    <td>{indexOfFirstUser + index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>

                    <td>
                      <span
                        className={`badge ${
                          user.role === "admin"
                            ? "badge-success"
                            : "badge-ghost"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          user.isBlocked
                            ? "badge-error"
                            : "badge-success"
                        }`}
                      >
                        {user.isBlocked
                          ? "Blocked"
                          : "Active"}
                      </span>
                    </td>

                    <td className="flex gap-2">
                      <button
                        onClick={() =>
                          promoteUser(user._id)
                        }
                        className="btn btn-sm btn-success"
                        disabled={user.role === "admin"}
                      >
                        <ShieldCheck size={16} />
                      </button>

                      <button
                        onClick={() =>
                          toggleBlock(user._id)
                        }
                        className="btn btn-sm btn-warning"
                      >
                        {user.isBlocked ? (
                          <Unlock size={16} />
                        ) : (
                          <Lock size={16} />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          setSelectedUser(user)
                        }
                        className="btn btn-sm btn-error"
                        disabled={user.role === "admin"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty */}
          {filteredUsers.length === 0 && (
            <p className="text-center mt-4 text-gray-500">
              No matching users
            </p>
          )}

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-4">
            <button
              className="btn btn-sm"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((p) => p - 1)
              }
            >
              Prev
            </button>

            {Array.from(
              { length: totalPages },
              (_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${
                    currentPage === i + 1
                      ? "btn-primary"
                      : ""
                  }`}
                  onClick={() =>
                    setCurrentPage(i + 1)
                  }
                >
                  {i + 1}
                </button>
              )
            )}

            <button
              className="btn btn-sm"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((p) => p + 1)
              }
            >
              Next
            </button>
          </div>
        </div>

        {/* Delete Modal */}
        {selectedUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded">
              <h2 className="text-lg font-bold mb-3">
                Delete User
              </h2>

              <p className="mb-4">
                Delete {selectedUser.name}?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setSelectedUser(null)
                  }
                  className="btn"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    deleteUser(selectedUser._id);
                    setSelectedUser(null);
                  }}
                  className="btn btn-error"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserManagement;
