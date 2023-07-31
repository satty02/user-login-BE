// Create the server and connect to the MySQL database
require('dotenv').config();
const express =require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 5000;

const url = process.env.MYSQL_ADDON_URI

const db = mysql.createConnection(url);



db.connect((err)=>{
    if(err){
        throw err;
    } 
    console.log('Connected to MySQL database successfully')
});

// Creating the API endpoint to receive and validate login credentials

app.use(bodyParser.json());
app.use(cors())

app.get('/api/users', (req, res) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error retrieving data from the database.' });
      }
      return res.json(result);
    });
  });



  app.post('/api/login', (req, res) => {
    const { username, password, dob } = req.body;
  
    // Checking if the entered credentials match with the data stored in the "users" table
    const query = 'SELECT * FROM users WHERE username = ? AND password = ? AND dob = ?';
  
    db.query(query, [username, password, dob], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
      }
  
      if (result.length === 1) {
        // Successful login
        return res.json({ success: true, message: 'Login successful' , result:result[0].name });
      } else {
        // Invalid login: Check for invalid username, password, or dob
        const queryByUsername = 'SELECT * FROM users WHERE username = ?';
        const queryByPassword = 'SELECT * FROM users WHERE password = ?';
        const queryByDob = 'SELECT * FROM users WHERE dob = ?';
  
        db.query(queryByUsername, [username], (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
          }
  
          if (result.length === 0) {
            // Invalid username
            return res.json({ success: false, message: 'Email doesn’t exist' });
          }
  
          db.query(queryByPassword, [password], (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ success: false, message: 'Internal server error.' });
            }
  
            if (result.length === 0) {
              // Invalid password
              return res.json({ success: false, message: 'Password is not correct' });
            }
  
            db.query(queryByDob, [dob], (err, result) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Internal server error.' });
              }
  
              if (result.length === 0) {
                // Invalid date of birth (dob)
                return res.json({ success: false, message: 'Invalid date' });
              }
  
              // If none of the checks match, it means the combination of username, password, and dob is incorrect
              return res.status(401).json({ success: false, message: 'Invalid login credentials' });
            });
          });
        });
      }
    });
  });


app.listen(port , ()=>{
    console.log(`Server running on port ${port}`)
});