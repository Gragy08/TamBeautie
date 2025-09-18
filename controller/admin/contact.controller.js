module.exports.contact = (req, res) => {
  res.render("admin/pages/contact", {
    pageTitle: "Quản lý danh sách liên hệ"
  });
}

module.exports.createContact = (req,res) => {
  res.render("admin/pages/contact-create", {
    pageTitle: "Tạo liên hệ mới"
  });
}
module.exports.createContactPost = (req,res) => {
  console.log(req.body);

  res.json({
    code: "success",
    message: "Tạo liên hệ thành công!"
  })
}