const { model } = require("mongoose");
const Contact = require("../../models/contact.model");
const Service = require("../../models/service.model")
const moment = require("moment");
const slugify = require("slugify");

module.exports.booking = async (req, res) => {
  // Lấy tất cả Contact
  const contacts = await Contact.find({ deleted: false });

  // Gom tất cả bookings lại thành 1 mảng
  let allBookings = [];
  contacts.forEach(contact => {
    (contact.bookings || []).forEach(booking => {
      if (booking.deleted === false) {
        const bookingObj = booking.toObject ? booking.toObject() : booking;
        allBookings.push({
          ...bookingObj,
          contactId: contact._id,
          contactName: contact.fullName,
          contactPhone: contact.phone,
          formatedDate: bookingObj.date ? moment(bookingObj.date).format("YYYY-MM-DD") : ""
        });
      }
    });
  });

  // Nếu có keyword, lọc theo tên dịch vụ hoặc trường search
  if (req.query.keyword) {
    const keyword = req.query.keyword.toLowerCase();
    allBookings = allBookings.filter(item =>
        (item.contactPhone && item.contactPhone.toLowerCase().includes(keyword)) ||
        (item.search && item.search.toLowerCase().includes(keyword))
    );
  }

  // Sắp xếp tất cả bookings theo date giảm dần
  allBookings = allBookings.sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);
    return dateB - dateA;
  });

  // Phân trang bookingList
    const limitItems = 5; // Số item mỗi trang
    let page = 1;
    if (req.query.page && parseInt(req.query.page) > 0) {
      page = parseInt(req.query.page);
    }
    const totalRecord = allBookings.length;
    const totalPage = Math.ceil(totalRecord / limitItems);
    const skip = (page - 1) * limitItems;
    const pagination = {
      totalRecord: totalRecord,
      totalPage: totalPage,
      page: page,
      limitItems: limitItems,
      skip: skip
    };
    const pagedBookingList = allBookings.slice(skip, skip + limitItems);

  res.render("admin/pages/booking", {
    pageTitle: "Quản lý đơn khám",
    bookingList: pagedBookingList,
    pagination: pagination
  });
}

module.exports.trashList = async (req, res) => {
  // Lấy tất cả Contact
  const contacts = await Contact.find({ deleted: false });

  // Gom tất cả bookings lại thành 1 mảng
  let allBookings = [];
  contacts.forEach(contact => {
    (contact.bookings || []).forEach(booking => {
      if (booking.deleted === true) {
        const bookingObj = booking.toObject ? booking.toObject() : booking;
        allBookings.push({
          ...bookingObj,
          contactId: contact._id,
          contactName: contact.fullName,
          contactPhone: contact.phone,
          formatedDate: bookingObj.date ? moment(bookingObj.date).format("YYYY-MM-DD") : ""
        });
      }
    });
  });

  // Sắp xếp tất cả bookings theo date giảm dần
  allBookings = allBookings.sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);
    return dateB - dateA;
  });

  res.render("admin/pages/booking-trashList", {
    pageTitle: "Thùng rác các đơn khám",
    bookingList: allBookings
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

    console.log(services, req.body);

    const booking = {
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
    };

    // Thêm booking mới vào mảng bookings
    contact.bookings.push(booking);
    await contact.save();

    res.json({ code: "success", message: "Tạo đơn khám thành công!" });
  } catch (error) {
    res.json({ code: "error", message: "Có lỗi xảy ra!" });
  }
}

module.exports.edit = async (req, res) => {
  try {
    const contactId = req.params.id;
    const bookingId = req.params.bookingId;

    // Tìm contact
    const contact = await Contact.findById(contactId);
    if (!contact) {
      res.redirect(`/${pathAdmin}/contact/list`);
      return;
    }

    // Tìm booking trong mảng bookings
    const bookingDetail = contact.bookings.id(bookingId) || contact.bookings.find(b => b._id && b._id.toString() === bookingId);
    if (!bookingDetail) {
      res.redirect(`/${pathAdmin}/contact/view/${contactId}`);
      return;
    }

    // Format lại ngày nếu có
    let bookingObj = bookingDetail.toObject ? bookingDetail.toObject() : {...bookingDetail};
    if (bookingObj.date) {
      bookingObj.dateFormatted = moment(bookingObj.date).format("YYYY-MM-DD");
    }

    const serviceList = await Service.find({
        deleted: false
    })

    res.render("admin/pages/booking-edit", {
      pageTitle: "Chỉnh sửa đơn khám",
      contactDetail: contact.toObject(),
      bookingDetail: bookingObj,
      serviceList: serviceList
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/contact/list`);
  }
}
module.exports.editPatch = async (req, res) => {
  try {
  const contactId = req.params.id;
  // Tìm contact theo id
  const contact = await Contact.findById(contactId);
  if (!contact) {
    res.json({ code: "error", message: "Không tìm thấy khách hàng!" });
    return;
  }

  // Tìm booking trong mảng bookings
  const bookingId = req.params.bookingId;
  const booking = contact.bookings.id(bookingId) || contact.bookings.find(b => b._id && b._id.toString() === bookingId);

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

  // Cập nhật các trường của booking
  booking.services = services;
  // booking.name = req.body.name;
  // booking.price = req.body.price;
  // booking.unit = req.body.unit;
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

  await contact.save();

  res.json({ code: "success", message: "Cập nhật đơn khám thành công!" });
  } catch (error) {
    res.json({ code: "error", message: "Có lỗi xảy ra!" });
  }
}

module.exports.trashCustomerBooking = async (req, res) => {
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
    let bookingList = (contactObj.bookings || []).filter(item => item.deleted === true);
    bookingList = bookingList.map(item => {
        return {
        ...item,
        dateFormatted: item.date ? moment(item.date).format("YYYY-MM-DD") : ""
        };
    });

    res.render("admin/pages/booking-trash", {
        pageTitle: "Thùng rác lịch khám",
        contactDetail: contactObj,
        bookingList: bookingList
    });
}

module.exports.deleteBookingPatch = async (req, res) => {
  try {
    const contactId = req.params.id;
    // Tìm contact theo id
    const contact = await Contact.findById(contactId);
    if (!contact) {
      res.json({ code: "error", message: "Không tìm thấy khách hàng!" });
      return;
    }

    // Tìm booking trong mảng bookings
    const bookingId = req.params.bookingId;
    const booking = contact.bookings.id(bookingId) || contact.bookings.find(b => b._id && b._id.toString() === bookingId);

    if (!booking) {
      res.json({ code: "error", message: "Không tìm thấy đơn khám!" });
      return;
    }

  // Cập nhật các trường của booking
  booking.deleted = true;
  booking.deletedAt = new Date();

  await contact.save();

  res.json({ code: "success", message: "Xóa đơn khám thành công!" });
  } catch (error) {
    res.json({ code: "error", message: "Có lỗi xảy ra!" });
  }
}
module.exports.undoBookingPatch = async (req, res) => {
  try {
    const contactId = req.params.id;
    // Tìm contact theo id
    const contact = await Contact.findById(contactId);
    if (!contact) {
      res.json({ code: "error", message: "Không tìm thấy khách hàng!" });
      return;
    }

    // Tìm booking trong mảng bookings
    const bookingId = req.params.bookingId;
    const booking = contact.bookings.id(bookingId) || contact.bookings.find(b => b._id && b._id.toString() === bookingId);

    if (!booking) {
      res.json({ code: "error", message: "Không tìm thấy đơn khám!" });
      return;
    }

  // Cập nhật các trường của booking
  booking.deleted = false;
  booking.deletedAt = new Date();

  await contact.save();

  res.json({ code: "success", message: "Khôi phục đơn khám thành công!" });
  } catch (error) {
    res.json({ code: "error", message: "Có lỗi xảy ra!" });
  }
}
module.exports.destroyBookingDelete = async (req, res) => {
    try {
    const contactId = req.params.id;
    // Tìm contact theo id
    const contact = await Contact.findById(contactId);
    if (!contact) {
      res.json({ code: "error", message: "Không tìm thấy khách hàng!" });
      return;
    }

    // Tìm booking trong mảng bookings
    const bookingId = req.params.bookingId;

    const bookingSub = contact.bookings.id(bookingId);
    if (!bookingSub) {
      return res.json({ code: "error", message: "Không tìm thấy đơn khám!" });
    }

    // Xóa booking bằng cách filter (an toàn hơn remove)
    contact.bookings = contact.bookings.filter(
      b => b._id.toString() !== bookingId
    );

    await contact.save();

  res.json({ code: "success", message: "Đã xóa vĩnh viễn đơn khám!" });
  } catch (error) {
    res.json({ code: "error", message: "Có lỗi xảy ra!" });
  }
}

module.exports.bulkStatusPatch = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || !status) {
      return res.json({ code: "error", message: "Thiếu dữ liệu!" });
    }

    // Tìm tất cả contact có booking cần đổi trạng thái
    const contacts = await Contact.find({
      "bookings._id": { $in: ids }
    });

    let updatedCount = 0;
    for (const contact of contacts) {
      let changed = false;
      contact.bookings.forEach(booking => {
        if (ids.includes(booking._id.toString())) {
          booking.status = status;
          changed = true;
          updatedCount++;
        }
      });
      if (changed) {
        await contact.save();
      }
    }

    res.json({ code: "success", message: `Đã cập nhật trạng thái ${updatedCount} đơn khám!` });
  } catch (error) {
    res.json({ code: "error", message: "Có lỗi xảy ra!" });
  }
}