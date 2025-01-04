import express from "express";
import cors from "cors";
import filingsRoute from "./routes/api.js"; // Import API routes

const app = express();
const port = 4000;

// Configure CORS to allow requests only from http://localhost:3000
app.use(cors({ origin: "http://localhost:3000" }));

// Middleware for parsing JSON
app.use(express.json());

// API routes
app.use("/api", filingsRoute);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
