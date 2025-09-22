const Service = require("../../models/service.model");
const slugify = require("slugify");
const { pathAdmin } = require('../../config/variable');

module.exports.service = async (req, res) => {
  const recordList = await Service.find({
    deleted: false
  })

  res.render("admin/pages/service", {
    pageTitle: "Quản lý dịch vụ",
    recordList: recordList
  });
}

module.exports.trashService = async (req, res) => {
    const recordList = await Service.find({
      deleted: true
    })

    res.render("admin/pages/service-trash", {
        pageTitle: "Thùng rác dịch vụ",
        recordList: recordList
    })
}

module.exports.createService = (req, res) => {
  res.render("admin/pages/service-create", {
    pageTitle: "Tạo dịch vụ mới"
  });
}

module.exports.createServicePost = async (req, res) => {
  try {
    console.log(req.body);

    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true
    });

    const newRecord = new Service(req.body);
    await newRecord.save();

    res.json({
        code: "success",
        message: "Tạo dịch vụ thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

module.exports.editService = async (req, res) => {
  try {
    const serviceList = await Service.find({});

    const id = req.params.id;

    const serviceDetail = await Service.findOne({
      _id: id,
      deleted: false
    })

    if(!serviceDetail) {
      res.redirect(`/${pathAdmin}/service/list`);
      return;
    }

    res.render("admin/pages/service-edit", {
      pageTitle: "Chỉnh sửa chi tiết dịch vụ",
      serviceDetail: serviceDetail
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/service/list`);
  }
}

module.exports.editServicePatch = async (req, res) => {
  try {
    const id = req.params.id;

    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true
    });

    await Service.updateOne({
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

module.exports.deleteServicePatch = async (req, res) => {
  try {
    const id = req.params.id;

    await Service.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedAt: Date.now()
    })

    res.json({
      code: "success",
      message: "Xóa dịch vụ thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}

module.exports.undoServicePatch = async (req, res) => {
  try {
    const id = req.params.id;

    await Service.updateOne({
      _id: id
    }, {
      deleted: false
    })

    res.json({
      code: "success",
      message: "Khôi phục dịch vụ thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}

module.exports.destroyServiceDelete = async (req, res) => {
  try {
    const id = req.params.id;

    await Service.deleteOne({
      _id: id
    })

    res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn dịch vụ!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}