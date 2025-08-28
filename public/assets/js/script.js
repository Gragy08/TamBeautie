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