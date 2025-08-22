const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://giaqui1712:EDrFE61LVcnODHpT@cluster0.otsxhah.mongodb.net/tambeautie-spa');

const Blog = mongoose.model('Blog', {
    name: String
});

const app = express();
const port = 3000;

//Set up Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Set up Static Files
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    res.render("client/pages/home")
})

app.get('/blogs', (req, res) => {
    res.render("client/pages/blog-list")
})

app.listen(port, () => {
    console.log(`TamBeautie app listening at http://localhost:${port}`);
})