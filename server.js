const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON request bodies
app.use(bodyParser.json());

// API routes
app.post('/api/gpt/init', (req, res) => {
  // Handle GPT initialization request
  const { name } = req.body;
  console.log(`Initializing GPT with persona '${name}'...`);
  res.status(200).send();
});

app.get('/api/personas', (req, res) => {
  // Handle persona list request
  const personas = [
    { name: 'Persona 1', profile_pic: '/images/persona1.jpg' },
    { name: 'Persona 2', profile_pic: '/images/persona2.jpg' },
    { name: 'Persona 3', profile_pic: '/images/persona3.jpg' }
  ];
  res.status(200).json(personas);
});

// Image routes
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
