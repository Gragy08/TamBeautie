const Contact = require("../../models/contact.model");
const slugify = require("slugify");

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
  try {
    console.log(req.body);

    req.body.search = slugify(`${req.body.fullName}`, {
      replacement: " ",
      lower: true
    });

    const newContact = new Contact(req.body);
    await newContact.save();

    res.json({
      code: "success",
      message: "Tạo liên hệ thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}