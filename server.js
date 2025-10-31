const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(__dirname));

// Route for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for contact page
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

// Authentication routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/verify', (req, res) => {
  // Email verification page - handles magic link verification
  res.sendFile(path.join(__dirname, 'verify.html'));
});

app.get('/logout', (req, res) => {
  // Logout is handled client-side via Supabase
  // Redirect to login
  res.redirect('/login');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Main page: http://localhost:${PORT}/`);
  console.log(`Contact page: http://localhost:${PORT}/contact`);
  console.log(`Login page: http://localhost:${PORT}/login`);
});

