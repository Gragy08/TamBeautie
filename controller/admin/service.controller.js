const Service = require("../../models/service.model");

module.exports.service = (req, res) => {
  res.render("admin/pages/service", {
    pageTitle: "Quản lý dịch vụ"
  });
}

module.exports.createService = (req, res) => {
  res.render("admin/pages/service-create", {
    pageTitle: "Tạo dịch vụ mới"
  });
}

module.exports.createServicePost = async (req, res) => {
  console.log(req.body);
  const newRecord = new Service(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Tạo dịch vụ thành công!"
  })
}
