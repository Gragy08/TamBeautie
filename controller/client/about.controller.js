module.exports.about = async (req, res) => {
    res.render("client/pages/about", {
        pageTitle: "Trang Giới Thiệu",
    });
}