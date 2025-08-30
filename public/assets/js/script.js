const overlay = document.getElementById('overlay');
const closeBtn = document.querySelector('.close-btn');
const navbar = document.querySelector(".navbar");
const toggle = document.querySelector(".menu-toggle");

window.addEventListener("scroll", function() {
  const header = document.querySelector(".header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  toggle.addEventListener("click", () => {
    navbar.classList.toggle("active");
    overlay.classList.toggle("show"); // bật/tắt overlay luôn
  });
});

closeBtn.addEventListener('click', () => {
  navbar.classList.remove('active');
  overlay.classList.remove('show');
});

overlay.addEventListener('click', () => {
  navbar.classList.remove('active'); // đồng bộ với toggle
  overlay.classList.remove('show');
});

// script.js

function startCountdown(targetDateStr, containerSelector) {
  const targetDate = new Date(targetDateStr).getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    let distance = targetDate - now;

    if (distance < 0) {
      document.querySelector(containerSelector).innerHTML = "<p>Khuyến mãi đã kết thúc</p>";
      clearInterval(timer);
      return;
    }

    // Tính toán ngày, giờ, phút, giây
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update DOM
    const numbers = document.querySelectorAll(containerSelector + " .countdown-number");
    numbers[0].textContent = String(days).padStart(2, '0');
    numbers[1].textContent = String(hours).padStart(2, '0');
    numbers[2].textContent = String(minutes).padStart(2, '0');
    numbers[3].textContent = String(seconds).padStart(2, '0');
  }

  // Cập nhật mỗi giây
  const timer = setInterval(updateCountdown, 1000);
  updateCountdown(); // gọi lần đầu để hiển thị ngay
}

// Gọi hàm khi load trang
document.addEventListener("DOMContentLoaded", function() {
  startCountdown("2025-09-30T23:59:59", ".countdown-container");
});