const express = require('express');
const path = require('path');
require('dotenv').config();
const database = require('./config/database');
const clientRoutes = require('./routes/client/index.route');
const admintRoutes = require("./routes/admin/index.route");
const variableConfig = require("./config/variable");

const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 3000;

// Connect to the database
database.connect();

// Set up Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Set up Static Files
app.use(express.static(path.join(__dirname, "public")));

app.locals.pathAdmin = variableConfig.pathAdmin;

global.pathAdmin = variableConfig.pathAdmin;

app.use(express.json());

app.use(cookieParser("GIAQUIDEPTRAISO1"));

// Thiet lap duong dan
app.use(`/${variableConfig.pathAdmin}`, admintRoutes);
app.use("/", clientRoutes);

// 👉 Khi chạy local (node index.js) thì listen
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 TamBeautie app listening at http://localhost:${port}`);
  });
}

// 👉 Khi deploy Vercel thì export app
module.exports = app;