
const Contact = require('../../models/contact.model');
const Service = require('../../models/service.model');
const moment = require('moment');

module.exports.dashboard = async (req, res) => {
  // Thời gian tháng hiện tại
  const now = moment();
  const startOfMonth = now.clone().startOf('month').toDate();
  const endOfMonth = now.clone().endOf('month').toDate();

  // Lấy toàn bộ contact
  const contacts = await Contact.find({ deleted: false });
  let monthlyRevenue = 0;
  let bookingsThisMonth = [];
  let serviceCount = {};
  let birthdayCustomers = [];
  // Tổng doanh thu toàn bộ, tổng đơn khám toàn bộ
  let totalRevenue = 0;
  let totalBookings = 0;
  // Mảng doanh thu từng ngày cho từng tháng (key: 'YYYY-MM')
  let monthlyDailyRevenue = {};
  // Mảng doanh thu từng ngày tháng hiện tại (mặc định)
  const daysInMonth = now.daysInMonth();
  let dailyRevenue = Array(daysInMonth).fill(0);

  contacts.forEach(contact => {
    // Sinh nhật trong tháng này
    if (contact.dob && moment(contact.dob).month() === now.month()) {
      birthdayCustomers.push({
        fullName: contact.fullName,
        phone: contact.phone,
        dob: contact.dob
      });
    }
    // Duyệt bookings
    (contact.bookings || []).forEach(booking => {
      if (!booking.deleted) {
        totalRevenue += booking.pay || 0;
        totalBookings++;
      }
      // Thống kê cho tháng hiện tại
      if (booking.date && booking.date >= startOfMonth && booking.date <= endOfMonth && !booking.deleted) {
        monthlyRevenue += booking.pay || 0;
        bookingsThisMonth.push({
          ...booking._doc,
          customerName: contact.fullName,
          customerPhone: contact.phone
        });
        // Đếm dịch vụ
        (booking.services || []).forEach(sv => {
          if (sv.name) {
            serviceCount[sv.name] = (serviceCount[sv.name] || 0) + 1;
          }
        });
        // Tính doanh thu từng ngày tháng hiện tại
        const day = moment(booking.date).date();
        if (day >= 1 && day <= daysInMonth) {
          dailyRevenue[day - 1] += booking.pay || 0;
        }
      }
      // Thống kê cho tất cả các tháng
      if (booking.date && !booking.deleted) {
        const m = moment(booking.date);
        const key = m.format('YYYY-MM');
        const day = m.date();
        if (!monthlyDailyRevenue[key]) {
          monthlyDailyRevenue[key] = Array(m.daysInMonth()).fill(0);
        }
        if (day >= 1 && day <= monthlyDailyRevenue[key].length) {
          monthlyDailyRevenue[key][day - 1] += booking.pay || 0;
        }
      }
    });
  });

  // 2. Top 5 dịch vụ khách dùng nhiều nhất
  const topServices = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  res.render('admin/pages/dashboard', {
    pageTitle: 'Tổng quan',
    monthlyRevenue,
    topServices,
    birthdayCustomers,
    bookingsThisMonth,
    dailyRevenue,
    monthlyDailyRevenue,
    totalRevenue,
    totalBookings
  });
};
