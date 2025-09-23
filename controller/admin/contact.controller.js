const Contact = require("../../models/contact.model");
const slugify = require("slugify");
const moment = require("moment");
const { pathAdmin } = require('../../config/variable');

module.exports.contact = async (req, res) => {
  // const recordList = await Contact.find({
  //   deleted: false
  // })

  const find = {
    deleted: false
  };

  if(req.query.keyword) {
    const keyword = req.query.keyword;
    find.search = keyword;
  }

  // const recordList = await Contact.find(find);

  // Phân trang
  const limitItems = 5;
  let page = 1;
  if(req.query.page && parseInt(`${req.query.page}`) > 0) {
    page = parseInt(`${req.query.page}`);
  }
  const totalRecord = await Contact.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    totalRecord: totalRecord,
    totalPage: totalPage,
    skip: skip
  };
  // Hết Phân trang

  const recordList = await Contact
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .limit(limitItems)
    .skip(skip)

  // format dob cho từng bản ghi
  const formattedRecords = recordList.map(item => {
    return {
      ...item._doc, // copy các field gốc
      dob: item.dob ? moment(item.dob).format("DD/MM/YYYY") : "" // format ngày
    };
  });

  res.render("admin/pages/contact", {
    pageTitle: "Quản lý danh sách khách hàng",
    recordList: formattedRecords,
    pagination: pagination
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
    pageTitle: "Thùng rác khách hàng",
    recordList: formattedRecords
  });
}

module.exports.createContact = (req,res) => {
  res.render("admin/pages/contact-create", {
    pageTitle: "Tạo khách hàng mới"
  });
}
module.exports.createContactPost = async (req,res) => {
  try {
    console.log(req.body);

    // Kiểm tra số điện thoại đã tồn tại chưa
    const existContact = await Contact.findOne({ phone: req.body.phone });
    if (existContact) {
      res.json({
        code: "error",
        message: "Số điện thoại đã trùng!"
      });
      return;
    }

    req.body.search = req.body.phone;

    const newContact = new Contact(req.body);
    await newContact.save();

    res.json({
      code: "success",
      message: "Tạo khách hàng thành công!"
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
      pageTitle: "Chỉnh sửa chi tiết khách hàng",
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
      message: "Xóa khách hàng thành công!"
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
      message: "Khôi phục khách hàng thành công!"
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
      message: "Đã xóa vĩnh viễn khách hàng!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}

module.exports.view = async (req, res) => {
  try {
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


    // Lấy danh sách booking có deleted = true và format lại trường date
    let bookingList = (contactObj.bookings || []).filter(item => item.deleted === false);
    bookingList = bookingList.map(item => {
        return {
        ...item,
        dateFormatted: item.date ? moment(item.date).format("YYYY-MM-DD") : ""
        };
    });

    res.render("admin/pages/contact-view", {
      pageTitle: "Xem chi tiết khách hàng",
      contactDetail: contactObj,
      bookingList: bookingList
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/contact/list`);
  }
}