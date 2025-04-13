const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const db = require('./db'); // Import db.js to handle MySQL connection
const path = require('path'); // For serving static files

const app = express();
const port = 3000;

// Middleware to serve static files (like index.html, script.js, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies for POST requests
app.use(bodyParser.json());

// Serve the index.html file when accessing the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Adjust this path if necessary
});

// Register User (with password hashing)
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  // Check if the username is already taken
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) return res.json({ error: 'Database error' });

    if (result.length > 0) {
      return res.json({ error: 'Username already taken' });
    }

    // Hash the password before storing it
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.json({ error: 'Error hashing password' });

      // Insert username and hashed password into the database
      db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err2) => {
        if (err2) return res.json({ error: 'Failed to register user' });

        res.json({ success: true });
      });
    });
  });
});

// Login User (with password comparison)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Fetch user from the database by username
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err || result.length === 0) return res.json({ error: 'User not found' });

    const user = result[0];

    // Compare the entered password with the hashed password in the database
    bcrypt.compare(password, user.password, (err2, match) => {
      if (err2 || !match) return res.json({ error: 'Invalid password' });

      res.json({ success: true, username: user.username });
    });
  });
});

// Fetch Messages (retrieve messages sent to the user)
app.get('/api/messages', (req, res) => {
  const { user1, user2 } = req.query;

  // Get messages between two users
  db.query('SELECT * FROM messages WHERE (sender_username = ? AND receiver_username = ?) OR (sender_username = ? AND receiver_username = ?)', [user1, user2, user2, user1], (err, result) => {
    if (err) return res.json({ error: 'Error fetching messages' });

    res.json({ messages: result });
  });
});

// Send Message
app.post('/api/send', (req, res) => {
  const { sender_username, receiver_username, content } = req.body;

  db.query('INSERT INTO messages (sender_username, receiver_username, content) VALUES (?, ?, ?)', [sender_username, receiver_username, content], (err) => {
    if (err) return res.json({ error: 'Failed to send message' });

    res.json({ success: true });
  });
});

// Fetch all users (excluding the logged-in user)
app.get('/api/users', (req, res) => {
  const currentUser = req.query.username; // Get the logged-in user from the query

  db.query('SELECT username FROM users WHERE username != ?', [currentUser], (err, result) => {
    if (err) return res.json({ error: 'Error fetching users' });

    res.json({ users: result });
  });
});

// Check if a user exists (using the correct connection)
app.get('/api/users/:username', (req, res) => {
  const username = req.params.username;
  const query = 'SELECT username FROM users WHERE username = ?';

  db.query(query, [username], (err, results) => {  // Use db.query, not connection.query
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  });
});

// Start the server
const PORT = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
