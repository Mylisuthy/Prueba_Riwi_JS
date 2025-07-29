 // import Modulos esencials
 const express = require('express');
 const mysql = require('mysql2');
 const cors = require('cors');
 
 // init express
 const app = express();

 // Middleware for  cors & json
 app.use(cors());
 app.use(express.json());

 // config conections wit mysql
 const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456789',
    database: 'eventGarden'
 });

 // connect to Database
 db.connect((err) => {
    if (err) {
        console.log('conection lost?', err);
    } else {
        console.log('conected to database');
    }
 });

 // server port
 const port = 3000;

 app.listen(port, () => {
    console.log(`server online an running on port http://localhost:${port}`);
 });

// Register user root
app.post('/usuarios', (req, res) => {
    const { nombre, email, password, admin } = req.body;

    // check if user already exists
    if (!nombre || !email || !password) {
        return res.status(400).json({ error: "all fields are requiered" });
    }

    // insert SQL query
    const query = 'INSERT INTO usuarios (nombre, email, password, admin) values (?, ?, ?, ?)';

    db.query(query, [nombre, email, password, admin ?? false], (error, results) => {
        if (error) {
            console.error('):, error in register:', error);
            return  res.status(500).json({ mensaje: "error in register :(" });
        }

        res.status(201).json({
            mensaje: 'user registered successfully',
            id: results.insertId
        });
    });
});