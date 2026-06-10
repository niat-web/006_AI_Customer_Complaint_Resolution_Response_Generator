const express = require("express");
const cors = require("cors");
require("dotenv").config();

const generateRoutes = require("./routes/generateRoutes");
const historyRoutes = require("./routes/historyRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const extractRoutes = require("./routes/extractRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Quiklee AI Complaint Resolution Backend is running");
});

app.use("/api", generateRoutes);
app.use("/api", historyRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", extractRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});