const express = require('express');
const path = require('path');
require('dotenv').config();
const database = require('./config/database');
const clientRoutes = require('./routes/client/index.route');

const app = express();
const port = 3000;

// Connect to the database
database.connect();

//Set up Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Set up Static Files
app.use(express.static(path.join(__dirname, "public")));

//Set up links to client routes
app.use('/', clientRoutes);

app.listen(port, () => {
    console.log(`TamBeautie app listening at http://localhost:${port}`);
})