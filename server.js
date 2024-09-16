const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
 
const app = express();
const port = 3000;
 
// Middleware
app.use(express.json());
app.use('/images', express.static('images'));
 
// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
 
const upload = multer({ storage: storage });
 
// Database connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'krissanarks_api'
});
 
// API to add a car
app.post('/add-car', upload.single('image'), (req, res) => {
    const { brand, model, year, color, price, fuel_type, doors, seats } = req.body;
    const image_url = req.file ? `/images/${req.file.filename}` : null;
 
    if (!brand || !model || !year || !color || !price || !doors || !seats) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
 
    const query = `INSERT INTO cars (brand, model, year, color, price, fuel_type, doors, seats, image_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
 
    db.query(query, [brand, model, year, color, price, fuel_type, doors, seats, image_url], (err, result) => {
        if (err) {
            console.error('Error inserting car:', err);
            return res.status(500).json({ error: 'Failed to add car' });
        }
        res.status(200).json({ message: 'Car added successfully' });
    });
});
 
// API to get all cars
app.get('/cars', (req, res) => {
    const query = 'SELECT * FROM cars';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving cars:', err);
            return res.status(500).json({ error: 'Failed to retrieve cars' });
        }
        res.status(200).json(results);
    });
});
 
 
// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
 