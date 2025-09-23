const Contact = require("../../models/contact.model");
const Service = require("../../models/service.model")
const moment = require("moment");
const slugify = require("slugify");

module.exports.booking = async (req, res) => {
  res.render("admin/pages/booking", {
    pageTitle: "Quản lý đơn khám"
  });
}

module.exports.create = async (req, res) => {
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

    const serviceList = await Service.find({
        deleted: false
    })

    res.render("admin/pages/booking-create", {
      pageTitle: "Tạo mới đơn khám",
      contactDetail: contactObj,
      serviceList: serviceList
    })
  } catch (error) {
    res.redirect(`/${pathAdmin}/contact/list`);
  }
}

module.exports.createPost = async (req, res) => {
  try {
    const contactId = req.params.id;
    // Tìm contact theo id
    const contact = await Contact.findById(contactId);
    if (!contact) {
      res.json({ code: "error", message: "Không tìm thấy khách hàng!" });
      return;
    }

    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true
    });

    // Thêm booking mới vào mảng bookings
    contact.bookings.push(req.body);
    await contact.save();

    res.json({ code: "success", message: "Tạo đơn khám thành công!" });
  } catch (error) {
    res.json({ code: "error", message: "Có lỗi xảy ra!" });
  }
}