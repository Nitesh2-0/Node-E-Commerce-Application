const profileBtn = document.getElementById("profile-btn");
const profileDropdown = document.getElementById("profile-dropdown");
const logoutBtn = document.getElementById("logout-btn");
const main = document.querySelector(".main");
const mostFrequentSearch = document.querySelector('.mostFrequent');

const addOption = document.getElementById('addOption');
let isProfileVisible = false;

profileBtn.addEventListener('click', toggleProfileDropdown);
logoutBtn.addEventListener("click", () => console.log("Logged out"));

function toggleProfileDropdown(event) {
  isProfileVisible = !isProfileVisible;
  // profileDropdown.style.display = isProfileVisible ? 'block' : 'none';
}

const productAvilable = document.getElementById("productAvilable");
const shopingBag = document.getElementById('shopingCart');
const avilableProductRaper = document.querySelector('.avilableProductRaper');
let isAvilableProductRaperVisible = false;

shopingBag.addEventListener('click', toggleAvilableProductRaper);
function toggleAvilableProductRaper() {
  isAvilableProductRaperVisible = !isAvilableProductRaperVisible;
  const leftValue = isAvilableProductRaperVisible ? "0%" : "-100%";
  const widthValue = window.innerWidth <= 640 ? '100%' : '40%';
  avilableProductRaper.style.left = leftValue;
  avilableProductRaper.style.width = widthValue;
}

var swiper = new Swiper(".swiper", {
  slidesPerView: "auto",
  spaceBetween: 30,
  autoplay: {
    delay: 3000,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});
