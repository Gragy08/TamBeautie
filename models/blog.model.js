const mongoose = require('mongoose');

const Blog = mongoose.model('Blog', {
    name: String,
});

module.exports.Blog = Blog;