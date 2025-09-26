const Contact = require('../../models/contact.model');
const Booking = require('../../models/booking.model');
const moment = require('moment');

module.exports.dashboard = async (req, res) => {
  const now = moment();
  const startOfMonth = now.clone().startOf('month').toDate();
  const endOfMonth = now.clone().endOf('month').toDate();

  // Lấy toàn bộ contact (để lấy sinh nhật)
  const contacts = await Contact.find({ deleted: false });
  // Lấy toàn bộ booking (đã tách bảng)
  const bookings = await Booking.find({ deleted: false }).populate('idCustomer');

  // Tổng hợp sinh nhật khách hàng tháng này
  let birthdayCustomers = contacts.filter(c => c.dob && moment(c.dob).month() === now.month())
    .map(c => ({ fullName: c.fullName, phone: c.phone, dob: c.dob }));

  // Tổng doanh thu toàn bộ, tổng đơn khám toàn bộ
  let totalRevenue = 0;
  let totalBookings = 0;
  let monthlyRevenue = 0;
  let bookingsThisMonth = [];
  let serviceCount = {};
  let monthlyDailyRevenue = {};
  const daysInMonth = now.daysInMonth();
  let dailyRevenue = Array(daysInMonth).fill(0);

  // Đếm số booking theo khách hàng
  let customerBookingCount = {};
  const nowDate = now.toDate();
  const sevenDaysAgo = moment(now).subtract(6, 'days').startOf('day').toDate();
  bookings.forEach(booking => {
    if (!booking.deleted) {
      totalRevenue += booking.pay || 0;
      totalBookings++;
      // Đếm booking theo khách hàng
      if (booking.idCustomer && booking.idCustomer._id) {
        const id = booking.idCustomer._id.toString();
        customerBookingCount[id] = customerBookingCount[id] || { count: 0, customer: booking.idCustomer };
        customerBookingCount[id].count++;
      }
    }
    // Thống kê cho tháng hiện tại
    if (booking.date && booking.date >= startOfMonth && booking.date <= endOfMonth && !booking.deleted) {
      monthlyRevenue += booking.pay || 0;
    }
    // Đơn khám 7 ngày gần nhất
    if (booking.date && booking.date >= sevenDaysAgo && booking.date <= nowDate && !booking.deleted) {
      bookingsThisMonth.push({
        ...booking._doc,
        customerName: booking.idCustomer ? booking.idCustomer.fullName : '',
        customerPhone: booking.idCustomer ? booking.idCustomer.phone : ''
      });
    }
    // Đếm dịch vụ
    if (booking.date && booking.date >= startOfMonth && booking.date <= endOfMonth && !booking.deleted) {
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

  // Top 5 dịch vụ khách dùng nhiều nhất
  const topServices = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Top 5 khách hàng thân thiết (nhiều booking nhất)
  const topCustomers = Object.values(customerBookingCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(({ customer, count }) => ({
      fullName: customer.fullName,
      phone: customer.phone,
      count
    }));

  res.render('admin/pages/dashboard', {
    pageTitle: 'Tổng quan',
    monthlyRevenue,
    topServices,
    birthdayCustomers,
    bookingsThisMonth,
    dailyRevenue,
    monthlyDailyRevenue,
    totalRevenue,
    totalBookings,
    topCustomers
  });
};
