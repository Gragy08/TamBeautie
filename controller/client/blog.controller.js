const Blog = require("../../models/blog.model");

module.exports.list = async (req, res) => {
    res.render("client/pages/blog-list", {
        pageTitle: "Danh sách Blog",
    })
}