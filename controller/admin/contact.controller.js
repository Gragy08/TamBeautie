const Contact = require("../../models/contact.model");
const slugify = require("slugify");
const moment = require("moment");

module.exports.contact = async (req, res) => {
  const recordList = await Contact.find({
    deleted: false
  })

  // format dob cho từng bản ghi
  const formattedRecords = recordList.map(item => {
    return {
      ...item._doc, // copy các field gốc
      dob: item.dob ? moment(item.dob).format("DD/MM/YYYY") : "" // format ngày
    };
  });

  res.render("admin/pages/contact", {
    pageTitle: "Quản lý danh sách liên hệ",
    recordList: formattedRecords
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