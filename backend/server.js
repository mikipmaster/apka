const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // <--- obsługa .env pliku

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/budget_db';

// Połączenie z MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Połączono z MongoDB.');
}).catch(err => {
  console.error('Błąd połączenia z MongoDB:', err);
});

// Model transakcji
const TransactionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, required: true }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint: pobierz wszystkie transakcje
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json({ transactions });
  } catch (err) {
    console.error('Błąd podczas pobierania transakcji:', err);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});

// Endpoint: dodaj nową transakcję
app.post('/api/transaction', async (req, res) => {
  const { type, category, amount, description, date } = req.body;

  if (!type || !category || !amount || !date) {
    return res.status(400).json({ message: 'Wszystkie pola oprócz opisu są wymagane.' });
  }

  try {
    const newTransaction = new Transaction({ type, category, amount, description, date });
    await newTransaction.save();
    res.json({ message: 'Transakcja została dodana.' });
  } catch (err) {
    console.error('Błąd podczas dodawania transakcji:', err);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
