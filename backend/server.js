const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';  // Use a secure, random key in production

// MongoDB connection URL (read from the environment variable)
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/myapp';

let db;

// Connect to MongoDB
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then(client => {
    db = client.db();
    console.log('Connected to MongoDB');
  })
  .catch(error => console.error(error));

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the backend of the 3-tier application with MongoDB!');
});

// API route to get data from MongoDB
app.get('/data', (req, res) => {
  db.collection('messages').findOne({}, (err, result) => {
    if (err) throw err;
    res.json(result || { message: 'No data found' });
  });
});

// API route to insert data into MongoDB
app.get('/add-data', (req, res) => {
  const message = { message: 'Hello from MongoDB!' };
  db.collection('messages').insertOne(message, (err, result) => {
    if (err) throw err;
    res.send('Data added to MongoDB');
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Route to login and generate a token
app.get('/login', (req, res) => {
  const username = req.query.username || 'guest';  // Simplified for demo
  const user = { name: username };
  const token = jwt.sign(user, secretKey);
  res.json({ token });
});

// Protected route using JWT
app.get('/secure-data', authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.name}, this is protected data.` });
});
