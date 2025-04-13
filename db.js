const mysql = require('mysql');

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',       // Your MySQL host
  user: 'root',            // Your MySQL username
  password: '',            // Your MySQL password (leave empty if not set)
  database: 'messaging_app'// The database you're using
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    return;
  }
  console.log('Connected to MySQL');
});

module.exports = connection; // Export the connection for use in other files