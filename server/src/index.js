import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

// Import your routes
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:5174", 
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    credentials: true,
  })
  
);

// Use routes with explicit paths to avoid collisions
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes); 
// Test route
app.get("/api", (req, res) => {
  res.send("API is live 🔥🔥🔥");
});

// MongoDB connection
async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ");
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🔥🔥🔥`);
  });
});
