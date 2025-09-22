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

module.exports.createServicePost = (req, res) => {
  console.log(req.body);

  res.json({
    code: "success",
    message: "Tạo dịch vụ thành công!"
  })
}
