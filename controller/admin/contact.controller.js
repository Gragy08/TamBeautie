const Contact = require("../../models/contact.model");
const slugify = require("slugify");
const moment = require("moment");
const { pathAdmin } = require('../../config/variable');

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
module.exports.trashContact = async (req, res) => {
  const recordList = await Contact.find({
    deleted: true
  })

  // format dob cho từng bản ghi
  const formattedRecords = recordList.map(item => {
    return {
      ...item._doc, // copy các field gốc
      dob: item.dob ? moment(item.dob).format("DD/MM/YYYY") : "" // format ngày
    };
  });

  res.render("admin/pages/contact-trash", {
    pageTitle: "Thùng rác liên hệ",
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

module.exports.editContact = async (req, res) => {
  try {
    const contactList = await Contact.find({});

    const id = req.params.id;

    const contactDetail = await Contact.findOne({
      _id: id,
      deleted: false
    })

    if(!contactDetail) {
      res.redirect(`/${pathAdmin}/contact/list`);
      return;
    }

    // Format lại ngày sinh để hiện đúng trong <input type="date">
    const contactObj = contactDetail.toObject(); 
    if (contactObj.dob) {
      contactObj.dobFormatted = moment(contactObj.dob).format("YYYY-MM-DD");
    }

    res.render("admin/pages/contact-edit", {
      pageTitle: "Chỉnh sửa chi tiết liên hệ",
      contactDetail: contactObj
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/contact/list`);
  }
}
module.exports.editContactPatch = async (req, res) => {
  try {
    const id = req.params.id;

    req.body.search = slugify(`${req.body.fullName}`, {
      replacement: " ",
      lower: true
    });

    console.log(req.body);

    await Contact.updateOne({
      _id: id,
      deleted: false
    }, req.body)

    res.json({
      code: "success",
      message: "Cập nhật thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

module.exports.deleteContactPatch = async (req, res) => {
  try {
    const id = req.params.id;

    await Contact.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedAt: Date.now()
    })

    res.json({
      code: "success",
      message: "Xóa liên hệ thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}
module.exports.undoContactPatch = async (req, res) => {
  try {
    const id = req.params.id;

    await Contact.updateOne({
      _id: id
    }, {
      deleted: false
    })

    res.json({
      code: "success",
      message: "Khôi phục liên hệ thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}
module.exports.destroyContactDelete = async (req, res) => {
  try {
    const id = req.params.id;

    await Contact.deleteOne({
      _id: id
    })

    res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn liên hệ!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}