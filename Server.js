const express = require("express");
const mysql2 = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.DB_PORT || 3000;

const dbConfig = mysql2.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});


// -------------------- CORS --------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.REACT_APP_API_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true);
    },
  })
);


// -------------------- GET --------------------
app.get("/phone", async (req, res) => {
  try {
    const [rows] = await dbConfig.execute("SELECT * FROM phones");

    if (rows.length === 0) {
      return res.status(404).json({
        message: "There are no products in the database",
      });
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// -------------------- POST --------------------
app.post("/phone", async (req, res) => {
  try {
    const { name, price, qty, model } = req.body;

    const [rows] = await dbConfig.execute(
      "INSERT INTO phones (name, price, qty, model) VALUES (?, ?, ?, ?)",
      [name, price, qty, model]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// -------------------- PUT --------------------
app.put("/phone/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, price, qty, model } = req.body;

    const [rows] = await dbConfig.execute(
      "UPDATE phones SET name=?, price=?, qty=?, model=? WHERE id=?",
      [name, parseFloat(price), qty, model, id]
    );

    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: "Update failed" });
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// -------------------- DELETE --------------------
app.delete("/phone/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [rows] = await dbConfig.execute(
      "DELETE FROM phones WHERE id=?",
      [id]
    );

    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: "Deletion failed" });
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// -------------------- 404 --------------------
app.use((req, res) => {
  res.status(404).json({ message: "404 route not found" });
});


app.listen(PORT, () => {
  console.log(`Server running at PORT ${PORT}`);
});