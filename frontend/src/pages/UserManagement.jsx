import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { Trash2, ShieldCheck, Lock, Unlock } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

// 🔥 CREATE AXIOS INSTANCE ONCE (OUTSIDE COMPONENT)
const api = axios.create({
  baseURL: `${API}/api`,
});

// 🔥 AUTO ATTACH TOKEN
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const usersPerPage = 5;

  // FETCH USERS
  const fetchUsers = async () => {
    setLoading(true);

    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // DEBOUNCE SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // DELETE USER
  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);

      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  // PROMOTE USER
  const promoteUser = async (id) => {
    try {
      await api.put(`/admin/promote/${id}`);

      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, role: "admin" } : u
        )
      );

      toast.success("User promoted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  // BLOCK / UNBLOCK
  const toggleBlock = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/block`);

      setUsers((prev) =>
        prev.map((u) =>
          u._id === id
            ? { ...u, isBlocked: !u.isBlocked }
            : u
        )
      );

      toast.success("Status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  // FILTER USERS (OPTIMIZED)
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
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
  }, [users, debouncedSearch, roleFilter, statusFilter]);

  // PAGINATION
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto">
        <div className="card bg-base-200 shadow-xl p-4">

          <h1 className="text-3xl font-bold text-center mb-6">
            User Management
          </h1>

          {/* FILTERS */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">

            <input
              className="input input-bordered"
              placeholder="Search..."
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
            {filteredUsers.length} users found
          </p>

          {/* TABLE */}
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
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

                      <td>{indexOfFirst + index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>

                      <td>
                        <span className="badge">
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
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      <td className="flex gap-2">

                        <button
                          onClick={() => promoteUser(user._id)}
                          className="btn btn-sm btn-success"
                          disabled={user.role === "admin"}
                        >
                          <ShieldCheck size={16} />
                        </button>

                        <button
                          onClick={() => toggleBlock(user._id)}
                          className="btn btn-sm btn-warning"
                        >
                          {user.isBlocked ? <Unlock size={16} /> : <Lock size={16} />}
                        </button>

                        <button
                          onClick={() => setSelectedUser(user)}
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
          )}

          {/* PAGINATION */}
          <div className="flex justify-center gap-2 mt-4">
            <button
              className="btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${
                  currentPage === i + 1 ? "btn-primary" : ""
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="btn btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>

        </div>

        {/* DELETE MODAL */}
        {selectedUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">

            <div className="bg-white p-6 rounded">
              <h2 className="font-bold mb-3">Delete User</h2>

              <p className="mb-4">
                Delete {selectedUser.name}?
              </p>

              <div className="flex gap-3">

                <button
                  className="btn"
                  onClick={() => setSelectedUser(null)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-error"
                  onClick={() => {
                    deleteUser(selectedUser._id);
                    setSelectedUser(null);
                  }}
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