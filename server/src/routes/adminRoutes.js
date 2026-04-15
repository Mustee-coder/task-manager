import express from "express";  
import { auth, adminOnly } from "../middleware/auth.middleware.js";  
import User from "../models/User.js";  
import Task from "../models/Task.js";  
  
const router = express.Router();  
  
// Get all users  
router.get("/users", auth, adminOnly, async (req, res) => {  
  try {  
    const users = await User.find().select("-password");  
    res.status(200).json(users);  
  } catch (error) {  
    res.status(500).json({ message: error.message });  
  }  
});  
  
// Get all tasks  
router.get("/tasks", auth, adminOnly, async (req, res) => {  
  try {  
    const tasks = await Task.find().populate("owner", "name email");  
    res.status(200).json(tasks);  
  } catch (error) {  
    res.status(500).json({ message: error.message });  
  }  
});  
  
  
  
  
//  Promote user to admin  
router.put("/promote/:id", auth, adminOnly, async (req, res) => {  
  try {  
    const user = await User.findById(req.params.id);  
  
    if (!user) return res.status(404).json({ message: "User not found" });  
    if (user.role === "admin") return res.status(400).json({ message: "User is already an admin" });  
  
    user.role = "admin";  
    await user.save();  
  
    res.status(200).json({ message: "User promoted to admin" });  
  } catch (error) {  
    res.status(500).json({ message: error.message });  
  }  
});  
  
// Delete a task  
router.delete("/tasks/:id", auth, adminOnly, async (req, res) => {  
  try {  
    const task = await Task.findByIdAndDelete(req.params.id);  
    if (!task) return res.status(404).json({ message: "Task not found" });  
  
    res.status(200).json({ message: "Task deleted successfully" });  
  } catch (error) {  
    res.status(500).json({ message: error.message });  
  }  
});  
  
//Delete a user  
router.delete("/users/:id", auth, adminOnly, async (req, res) => {  
  try {  
    const user = await User.findById(req.params.id);  
    if (!user) return res.status(404).json({ message: "User not found" });  
  
    // Prevent admin from deleting self  
    if (user._id.toString() === req.user.id)  
      return res.status(400).json({ message: "You cannot delete yourself" });  
  
    await User.findByIdAndDelete(req.params.id);  
    res.status(200).json({ message: "User deleted successfully" });  
  } catch (error) {  
    res.status(500).json({ message: error.message });  
  }  
});  
  
  
  
  
// Block / Unblock user  
router.patch("/users/:id/block", auth, adminOnly, async (req, res) => {  
  try {  
    const user = await User.findById(req.params.id);  
    if (!user) return res.status(404).json({ message: "User not found" });  
  
    // Prevent blocking other admins  
    if (user.role === "admin")  
      return res.status(403).json({ message: "Cannot block an admin" });  
  
    user.isBlocked = !user.isBlocked; // toggle block status  
    await user.save();  
  
    res.status(200).json({   
      message: user.isBlocked ? "User blocked" : "User unblocked",  
      isBlocked: user.isBlocked  
    });  
  } catch (error) {  
    res.status(500).json({ message: error.message });  
  }  
});  


export default router 
  
