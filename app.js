// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Define a GET route that responds with "Hello World"
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`);
});