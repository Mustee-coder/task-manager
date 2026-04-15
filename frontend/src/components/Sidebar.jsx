import { Link } from "react-router-dom";

const Sidebar = () => {
  const role = localStorage.getItem("userRole");

  return (
    <aside className="w-64 bg-white shadow-md p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-6 text-blue-600 font-[cursive]">TaskManager</h2>

      <nav className="flex flex-col gap-3">
        <Link
          to="/dashboard"
          className="px-3 py-2 rounded hover:bg-gray-100"
        >
          Dashboard
        </Link>

        <Link
          to="/tasks"
          className="px-3 py-2 rounded hover:bg-gray-100"
        >
          Tasks
        </Link>
        

        {role === "admin" && (
          <Link
            to="/users"
            className="px-3 py-2 rounded hover:bg-gray-100"
          >
            Users
          </Link>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
