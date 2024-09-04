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
    const { brand, model, year, color, price, magazine_brand, fuel_type, doors, seats } = req.body;
    const image_url = req.file ? `/images/${req.file.filename}` : null;

    if (!brand || !model || !year || !color || !price || !doors || !seats) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `INSERT INTO cars (brand, model, year, color, price, magazine_brand, fuel_type, doors, seats, image_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [brand, model, year, color, price, magazine_brand, fuel_type, doors, seats, image_url], (err, result) => {
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

// API to get a car by ID
app.get('/cars/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM cars WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error retrieving car:', err);
            return res.status(500).json({ error: 'Failed to retrieve car' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.status(200).json(result[0]);
    });
});

// API to update a car by ID
app.put('/cars/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { brand, model, year, color, price, magazine_brand, fuel_type, doors, seats } = req.body;
    const image_url = req.file ? `/images/${req.file.filename}` : null;

    const query = `UPDATE cars
                    SET brand = ?, model = ?, year = ?, color = ?, price = ?, magazine_brand = ?, fuel_type = ?, doors = ?, seats = ?, image_url = ?
                    WHERE id = ?`;

    db.query(query, [brand, model, year, color, price, magazine_brand, fuel_type, doors, seats, image_url, id], (err, result) => {
        if (err) {
            console.error('Error updating car:', err);
            return res.status(500).json({ error: 'Failed to update car' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.status(200).json({ message: 'Car updated successfully' });
    });
});

// API to delete a car by ID
app.delete('/cars/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM cars WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting car:', err);
            return res.status(500).json({ error: 'Failed to delete car' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.status(200).json({ message: 'Car deleted successfully' });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
