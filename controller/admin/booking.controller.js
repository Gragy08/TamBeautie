const { model } = require("mongoose");
const Contact = require("../../models/contact.model");
const Service = require("../../models/service.model")
const Booking = require("../../models/booking.model");
const moment = require("moment");
const slugify = require("slugify");

// Danh sách booking (list, filter, phân trang)
module.exports.booking = async (req, res) => {
  let filter = { deleted: false };
  if (req.query.keyword) {
    const keyword = req.query.keyword.toLowerCase();
    // Tìm kiếm theo search của booking hoặc search của khách hàng
    // Lấy danh sách contact có search match
    const contactIds = (await Contact.find({ search: { $regex: keyword, $options: "i" } }, '_id')).map(c => c._id);
    filter.$or = [
      { search: { $regex: keyword, $options: "i" } },
      { idCustomer: { $in: contactIds } }
    ];
  }
  let allBookings = await Booking.find(filter).populate('idCustomer');
  // Sắp xếp theo ngày giảm dần
  allBookings = allBookings.sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);
    return dateB - dateA;
  });
  // Phân trang
  const limitItems = 5;
  let page = 1;
  if (req.query.page && parseInt(req.query.page) > 0) {
    page = parseInt(req.query.page);
  }
  const totalRecord = allBookings.length;
  const totalPage = Math.ceil(totalRecord / limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    totalRecord,
    totalPage,
    page,
    limitItems,
    skip
  };
  const pagedBookingList = allBookings.slice(skip, skip + limitItems);
  // Format lại cho view
  const bookingList = pagedBookingList.map(b => ({
    ...b.toObject(),
    contactId: b.idCustomer?._id,
    contactName: b.idCustomer?.fullName,
    contactPhone: b.idCustomer?.phone,
    formatedDate: b.date ? moment(b.date).format("YYYY-MM-DD") : ""
  }));
  res.render("admin/pages/booking", {
    pageTitle: "Quản lý đơn khám",
    bookingList,
    pagination
  });
};


// Danh sách booking đã xóa (thùng rác)
module.exports.trashList = async (req, res) => {
  let allBookings = await Booking.find({ deleted: true }).populate('idCustomer');
  allBookings = allBookings.sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);
    return dateB - dateA;
  });
  const bookingList = allBookings.map(b => ({
    ...b.toObject(),
    contactId: b.idCustomer?._id,
    contactName: b.idCustomer?.fullName,
    contactPhone: b.idCustomer?.phone,
    formatedDate: b.date ? moment(b.date).format("YYYY-MM-DD") : ""
  }));
  res.render("admin/pages/booking-trashList", {
    pageTitle: "Thùng rác các đơn khám",
    bookingList
  });
};

// Danh sách booking đã xóa của 1 bệnh nhân
module.exports.trashCustomerBooking = async (req, res) => {
  const contactId = req.params.id;
  let allBookings = await Booking.find({ deleted: true, idCustomer: contactId }).populate('idCustomer');
  allBookings = allBookings.sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);
    return dateB - dateA;
  });
  let contactDetail = null;
  let customerName = '';
  if (allBookings.length > 0) {
    contactDetail = allBookings[0].idCustomer;
    customerName = contactDetail?.fullName || '';
  } else {
    // Nếu không có booking đã xóa, vẫn lấy tên khách hàng
    const contact = await Contact.findById(contactId);
    contactDetail = contact;
    customerName = contact ? contact.fullName : '';
  }
  const bookingList = allBookings.map(b => ({
    ...b.toObject(),
    contactId: b.idCustomer?._id,
    contactName: b.idCustomer?.fullName,
    contactPhone: b.idCustomer?.phone,
    formatedDate: b.date ? moment(b.date).format("YYYY-MM-DD") : ""
  }));
  res.render("admin/pages/booking-trash", {
    pageTitle: `Thùng rác đơn khám`,
    bookingList,
    contactDetail
  });
};

// Tạo booking (form)
module.exports.create = async (req, res) => {
  try {
    const id = req.params.id;
    const contactDetail = await Contact.findOne({ _id: id, deleted: false });
    if (!contactDetail) {
      res.redirect(`/${pathAdmin}/contact/list`);
      return;
    }
    const contactObj = contactDetail.toObject();
    if (contactObj.dob) {
      contactObj.dobFormatted = moment(contactObj.dob).format("YYYY-MM-DD");
    }
    const serviceList = await Service.find({ deleted: false });
    res.render("admin/pages/booking-create", {
      pageTitle: "Tạo mới đơn khám",
      contactDetail: contactObj,
      serviceList
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/contact/list`);
  }
};

// Tạo booking (POST)
module.exports.createPost = async (req, res) => {
  try {
    const contactId = req.params.id;
    const contact = await Contact.findById(contactId);
    if (!contact) {
      res.json({ code: "error", message: "Không tìm thấy khách hàng!" });
      return;
    }
    // Convert mảng song song -> array of objects
    const services = [];
    if (Array.isArray(req.body.name)) {
      req.body.name.forEach((n, i) => {
        services.push({
          name: n,
          price: parseFloat(req.body.price[i]) || 0,
          unit: parseInt(req.body.unit[i]) || 1
        });
      });
    }
    const booking = new Booking({
      idCustomer: contactId,
      services,
      promotion: parseFloat(req.body.promotion) || 0,
      total: parseFloat(req.body.total) || 0,
      deposit: parseFloat(req.body.deposit) || 0,
      pay: parseFloat(req.body.pay) || 0,
      date: req.body.date,
      status: req.body.status,
      description: req.body.description,
      search: slugify(req.body.name.join(" "), {
        replacement: " ",
        lower: true,
        strict: true,
        trim: true
      })
    });
    await booking.save();
    // Thêm id booking vào contact
    contact.bookings.push(booking._id);
    await contact.save();
    res.json({ code: "success", message: "Tạo đơn khám thành công!" });
  } catch (error) {
    res.json({ code: "error", message: "Có lỗi xảy ra!" });
  }
};

// Sửa booking (form)
module.exports.edit = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const bookingDetail = await Booking.findById(bookingId);
    if (!bookingDetail) {
      res.redirect(`/${pathAdmin}/booking/list`);
      return;
    }
    const contact = await Contact.findById(bookingDetail.idCustomer);
    if (!contact) {
      res.redirect(`/${pathAdmin}/contact/list`);
      return;
    }
    let bookingObj = bookingDetail.toObject();
    if (bookingObj.date) {
      bookingObj.dateFormatted = moment(bookingObj.date).format("YYYY-MM-DD");
    }
    const serviceList = await Service.find({ deleted: false });
    res.render("admin/pages/booking-edit", {
      pageTitle: "Chỉnh sửa đơn khám",
      contactDetail: contact.toObject(),
      bookingDetail: bookingObj,
      serviceList
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/contact/list`);
  }
};

// Sửa booking (PATCH)
module.exports.editPatch = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.json({ code: "error", message: "Không tìm thấy đơn khám!" });
      return;
    }
    // Convert mảng song song -> array of objects
    const services = [];
    if (Array.isArray(req.body.name)) {
      req.body.name.forEach((n, i) => {
        services.push({
          name: n,
          price: parseFloat(req.body.price[i]) || 0,
          unit: parseInt(req.body.unit[i]) || 1
        });
      });
    }
    booking.services = services;
    booking.promotion = req.body.promotion;
    booking.total = req.body.total;
    booking.deposit = req.body.deposit;
    booking.pay = req.body.pay;
    booking.date = req.body.date;
    booking.status = req.body.status;
    booking.description = req.body.description;
    booking.search = slugify(req.body.name.join(" "), {
      replacement: " ",
      lower: true,
      strict: true,
      trim: true
    });
    await booking.save();
    res.json({ code: "success", message: "Cập nhật đơn khám thành công!" });
  } catch (error) {
    res.json({ code: "error", message: "Có lỗi xảy ra!" });
  }
};

// Xem booking (view)
module.exports.view = async (req, res) => {
  try {
    const contactId = req.params.id;
    const bookingId = req.params.bookingId;
    const contact = await Contact.findById(contactId);
    if (!contact) {
      res.redirect(`/${pathAdmin}/contact/list`);
      return;
    }
    const bookingDetail = await Booking.findById(bookingId);
    if (!bookingDetail) {
      res.redirect(`/${pathAdmin}/contact/view/${contactId}`);
      return;
    }
    let bookingObj = bookingDetail.toObject();
    if (bookingObj.date) {
      bookingObj.dateFormatted = moment(bookingObj.date).format("YYYY-MM-DD");
    }
    const serviceList = await Service.find({ deleted: false });
    res.render("admin/pages/booking-view", {
      pageTitle: "Xem chi tiết đơn khám",
      contactDetail: contact.toObject(),
      bookingDetail: bookingObj,
      serviceList
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/contact/list`);
  }
};

// Xóa mềm booking (PATCH)
module.exports.deleteBookingPatch = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.json({ code: "error", message: "Không tìm thấy đơn khám!" });
      return;
    }
    booking.deleted = true;
    booking.deletedAt = new Date();
    await booking.save();
    res.json({ code: "success", message: "Xóa đơn khám thành công!" });
  } catch (error) {
    res.json({ code: "error", message: "Có lỗi xảy ra!" });
  }
};

// Khôi phục booking (PATCH)
module.exports.undoBookingPatch = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.json({ code: "error", message: "Không tìm thấy đơn khám!" });
      return;
    }
    booking.deleted = false;
    booking.deletedAt = new Date();
    await booking.save();
    res.json({ code: "success", message: "Khôi phục đơn khám thành công!" });
  } catch (error) {
    res.json({ code: "error", message: "Có lỗi xảy ra!" });
  }
};

// Xóa vĩnh viễn booking (DELETE)
module.exports.destroyBookingDelete = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.json({ code: "error", message: "Không tìm thấy đơn khám!" });
      return;
    }
    // Xóa id khỏi contact.bookings
    await Contact.updateMany({}, { $pull: { bookings: bookingId } });
    await Booking.deleteOne({ _id: bookingId });
    res.json({ code: "success", message: "Đã xóa vĩnh viễn đơn khám!" });
  } catch (error) {
    res.json({ code: "error", message: "Có lỗi xảy ra!" });
  }
};

// Bulk đổi trạng thái booking
module.exports.bulkStatusPatch = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || !status) {
      return res.json({ code: "error", message: "Thiếu dữ liệu!" });
    }
    const result = await Booking.updateMany({ _id: { $in: ids } }, { status });
    res.json({ code: "success", message: `Đã cập nhật trạng thái ${result.nModified || result.modifiedCount || 0} đơn khám!` });
  } catch (error) {
    res.json({ code: "error", message: "Có lỗi xảy ra!" });
  }
};