import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { runSeed } from "./seed.js";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import careerRoutes from "./routes/careers.js";
import skillRoutes from "./routes/skills.js";
import resourceRoutes from "./routes/resources.js";
import projectRoutes from "./routes/projects.js";
import progressRoutes from "./routes/progress.js";
import mentorRoutes from "./routes/mentor.js";
import quizRoutes from "./routes/quiz.js";
import searchRoutes from "./routes/search.js";
import dashboardRoutes from "./routes/dashboard.js";

// --------------------------------------------------
// Path setup
// --------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// frontend/dist is located at:
// career-guide-ai/frontend/dist
//
// server.js is located at:
// career-guide-ai/backend/src/server.js

const frontendPath = path.join(__dirname, "../../frontend/dist");

// --------------------------------------------------
// Seed database
// --------------------------------------------------

runSeed();

// --------------------------------------------------
// Create Express app
// --------------------------------------------------

const app = express();

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "career-guide-ai-backend"
  });
});

// --------------------------------------------------
// API Routes
// --------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/dashboard", dashboardRoutes);

// --------------------------------------------------
// Serve frontend
// --------------------------------------------------

app.use(express.static(frontendPath));

// --------------------------------------------------
// Frontend fallback
// --------------------------------------------------

// If the request is not an API request,
// send the Vite frontend index.html.

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

// --------------------------------------------------
// API 404 handler
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    error: "Not found."
  });
});

// --------------------------------------------------
// Centralized error handling
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: "Something went wrong on our end. Please try again."
  });
});

// --------------------------------------------------
// Start server
// --------------------------------------------------

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(
    `Career Guide AI backend running on port ${PORT}`
  );

  console.log(
    `Auth mode: ${process.env.AUTH_MODE || "dev"}`
  );
});