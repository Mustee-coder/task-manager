import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SignupPage from "./pages/SignupPage.jsx";
import LoginForm from "./pages/LoginForm.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Tasks from "./pages/Tasks.jsx";
import ViewTasks from "./pages/ViewTasks.jsx";
import Admin from "./pages/Admin.jsx";
import PendingTasks from "./pages/PendingTasks.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import {useThemeStore} from "./store/useThemeStore.js";









function App() {

const { theme } = useThemeStore()

  return (
  <div className="h-screen"data-theme={theme}>
      
     
        

    <Router>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/signup" element={<SignupPage />} />

        <Route path="/login" element={<LoginForm />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
<Route
  path="/admin"
  element={
    <ProtectedRoute role="admin">
      <Admin />
    </ProtectedRoute>
  }
/>
<Route path="/usermanagement" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />

        <Route
          path="/viewTasks"
          element={
            <ProtectedRoute>
              <ViewTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/PendingTasks"
          element={
            <ProtectedRoute>
              <PendingTasks />
            </ProtectedRoute>
          }
        />
        
       
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
      

    </Router>
    </div>
  );
}
export default App;
