require("dotenv").config();
console.log(
  "Gemini API key loaded:",
  !!process.env.GEMINI_API_KEY
);

const express = require("express");

const app = express();

app.use(express.json());
// const express =  require("express");
// const app = express();
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const questionRoutes = require("./routes/questionRoutes");


dotenv.config();

// const app = express();

const PORT = process.env.PORT || 5000;

// --------------------------------
// Middleware
// --------------------------------

app.use(cors());

app.use(express.json());

// --------------------------------
// Database
// --------------------------------

connectDB();

// --------------------------------
// Routes
// --------------------------------

app.use(
  "/api/questions",
  questionRoutes
);

// --------------------------------
// Health check
// --------------------------------

app.get("/", (req, res) => {
  res.json({
    message: "WeakToPeak API is running"
  });
});

// --------------------------------
// Start server
// --------------------------------

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});