require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


const ALLOWED_CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];



app.get('/api/expenses', async (req, res) => {
  try {


    const query = `
      SELECT 
        id, 
        title, 
        amount::float AS amount, 
        category, 
        TO_CHAR(date, 'YYYY-MM-DD') AS date 
      FROM expenses 
      ORDER BY date DESC, id DESC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});



app.get('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;



  if (isNaN(id)) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  try {
    const query = `
      SELECT 
        id, 
        title, 
        amount::float AS amount, 
        category, 
        TO_CHAR(date, 'YYYY-MM-DD') AS date 
      FROM expenses 
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});



app.post('/api/expenses', async (req, res) => {
  const { title, amount, category, date } = req.body;


  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required' });
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ message: 'Amount must be a number greater than 0' });
  }

  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({
      message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
    });
  }

  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  try {
    const query = `
      INSERT INTO expenses (title, amount, category, date)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        id, 
        title, 
        amount::float AS amount, 
        category, 
        TO_CHAR(date, 'YYYY-MM-DD') AS date
    `;
    const result = await pool.query(query, [title.trim(), numericAmount, category, date]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});


app.put('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  const { title, amount, category, date } = req.body;


  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required' });
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ message: 'Amount must be a number greater than 0' });
  }

  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({
      message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
    });
  }

  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  try {
    const query = `
      UPDATE expenses
      SET title = $1, amount = $2, category = $3, date = $4
      WHERE id = $5
      RETURNING 
        id, 
        title, 
        amount::float AS amount, 
        category, 
        TO_CHAR(date, 'YYYY-MM-DD') AS date
    `;
    const result = await pool.query(query, [title.trim(), numericAmount, category, date, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});


app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  try {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});