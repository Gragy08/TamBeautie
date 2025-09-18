const Contact = require("../../models/contact.model");

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
module.exports.createContactPost = async (req,res) => {
  console.log(req.body);
  const newContact = new Contact(req.body);
  await newContact.save();

  res.json({
    code: "success",
    message: "Tạo liên hệ thành công!"
  })
}