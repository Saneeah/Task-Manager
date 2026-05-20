const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

mongoose.connect("mongodb+srv://linkbaseUser:linkbase123@cluster0.ygjenhl.mongodb.net/linkbase")
  .then(() => {
    console.log("✅ MongoDB connected");
    app.use("/api/tasks", require("./routes/tasks"));
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB error:", err);
  });