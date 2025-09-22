const Service = require("../../models/service.model");
const slugify = require("slugify");

module.exports.service = async (req, res) => {
  const recordList = await Service.find({
    deleted: false
  })

  res.render("admin/pages/service", {
    pageTitle: "Quản lý dịch vụ",
    recordList: recordList
  });
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
