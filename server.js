// // server.js
// const express = require('express');
// const bodyParser = require('body-parser');
// const db = require('./db');

// const app = express();
// app.use(bodyParser.json());

// const PORT = process.env.PORT || 3000;

// // Haversine formula to calculate distance between two points
// const haversineDistance = (lat1, lon1, lat2, lon2) => {
//     const toRad = angle => (angle * Math.PI) / 180;
//     const R = 6371; // Earth radius in km
//     const dLat = toRad(lat2 - lat1);
//     const dLon = toRad(lon2 - lon1);
//     const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//               Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
//               Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
// };

// // Add School API
// app.post('/addSchool', (req, res) => {
//     const { name, address, latitude, longitude } = req.body;

//     // Input validation
//     if (!name || !address || typeof latitude !== 'number' || typeof longitude !== 'number') {
//         return res.status(400).send('Invalid input data');
//     }

//     const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
//     db.query(query, [name, address, latitude, longitude], (err, result) => {
//         if (err) {
//             console.error('Error inserting data:', err);
//             return res.status(500).send('Internal server error');
//         }
//         res.status(201).send('School added successfully');
//     });
// });

// // List Schools API
// app.get('/listSchools', (req, res) => {
//     const { latitude, longitude } = req.query;

//     if (typeof parseFloat(latitude) !== 'number' || typeof parseFloat(longitude) !== 'number') {
//         return res.status(400).send('Invalid input data');
//     }

//     const query = 'SELECT * FROM schools';
//     db.query(query, (err, results) => {
//         if (err) {
//             console.error('Error fetching data:', err);
//             return res.status(500).send('Internal server error');
//         }

//         const userLat = parseFloat(latitude);
//         const userLon = parseFloat(longitude);

//         const schools = results.map(school => {
//             const distance = haversineDistance(userLat, userLon, school.latitude, school.longitude);
//             return { ...school, distance };
//         });

//         schools.sort((a, b) => a.distance - b.distance);

//         res.status(200).json(schools);
//     });
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const haversine = require('haversine');

const app = express();
const port = 3000;


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'schoolmanagement'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});


app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.send('Welcome to the School Management System API! Use /addSchool to add a school and /listSchools to list schools.');
});


app.post('/addSchool', (req, res) => {
  console.log('Received POST /addSchool request');
  console.log('Request Body:', req.body);

  const { name, address, latitude, longitude } = req.body;
  
  if (!name || !address || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ message: 'All fields are required and must be correct types' });
  }

  const school = { name, address, latitude, longitude };
  const sql = 'INSERT INTO schools SET ?';

  db.query(sql, school, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, ...school });
  });
});


function calculateDistance(lat1, lon1, lat2, lon2) {
  const start = { latitude: lat1, longitude: lon1 };
  const end = { latitude: lat2, longitude: lon2 };
  return haversine(start, end);
}

// List Schools Endpoint
app.get('/listSchools', (req, res) => {
  console.log('Received GET /listSchools request');
  console.log('Query Params:', req.query);

  const { latitude, longitude } = req.query;

  if (typeof parseFloat(latitude) !== 'number' || typeof parseFloat(longitude) !== 'number') {
    return res.status(400).json({ message: 'Valid latitude and longitude are required' });
  }

  const userLat = parseFloat(latitude);
  const userLon = parseFloat(longitude);

  const sql = 'SELECT * FROM schools';

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    results.sort((a, b) => {
      const distanceA = calculateDistance(userLat, userLon, a.latitude, a.longitude);
      const distanceB = calculateDistance(userLat, userLon, b.latitude, b.longitude);
      return distanceA - distanceB;
    });

    res.status(200).json(results);
  });
});


app.listen(port, () => {
  const serverUrl = `http://localhost:${port}`;
  console.log(`Server running on port ${port}`);
  console.log(`Click here to access the API: ${serverUrl}`);
});
