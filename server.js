require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello Express!! 🚀");
});

app.listen(PORT, () => {
  console.log(`🪐 Server is running on port http://localhost:${PORT}`);
});
