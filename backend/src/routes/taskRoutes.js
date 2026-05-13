import express from "express";
import Task from "../models/Task.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

// CREATE TASK
router.post("/", auth, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, owner: req.user.id });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET ALL TASKS (pending & completed separated)
router.get("/", auth, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find().populate("owner", "name email");
    } else {
      tasks = await Task.find({ owner: req.user.id });
    }

    const pending = tasks.filter((t) => !t.completed);
    const completed = tasks.filter((t) => t.completed);

    res.status(200).json({ pending, completed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET SINGLE TASK
router.get("/:id", auth, async (req, res) => {
  try {
    const task = req.user.role === "admin"
      ? await Task.findById(req.params.id).populate("owner", "name email")
      : await Task.findOne({ _id: req.params.id, owner: req.user.id });

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE TASK
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }

    const { owner, ...updateData } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after" }
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE TASK
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MARK TASK AS COMPLETED
router.patch("/:id/complete", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }

    task.completed = true;
    await task.save();
    res.status(200).json({ message: "Task marked as completed", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MARK TASK AS PENDING
router.patch("/:id/pending", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }

    task.completed = false;
    await task.save();
    res.status(200).json({ message: "Task marked as pending", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
