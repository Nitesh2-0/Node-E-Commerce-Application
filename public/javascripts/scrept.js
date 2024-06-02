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

/* Razorpay-Request */
$(document).ready(() => {
  $('.pay-form').submit(function (e) {
    e.preventDefault();
    const formData = $(this).serialize();
    $.ajax({
      url: '/createOrder',
      type: 'POST',
      data: formData,
      success: function (res) {
        if (res.success) {
          const options = {
            "key": res.key_id,
            "amount": res.amount,
            "currency": "INR",
            "name": res.product_name,
            "image": "https://plus.unsplash.com/premium_photo-1678187782578-70b5a348f502?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "order_id": res.order_id,
            "handler": function (response) {
              alert('Payment Successful');
            },
            "prefill": {
              "contact": res.contact,
              "name": res.name,
              "email": res.email
            },
            "notes": {
              "description": res.description
            },
            "theme": {
              "color": "#2300a3"
            }
          };
          const razorpayObject = new Razorpay(options);
          razorpayObject.on('payment.failed', function (response) {
            alert('Payment Failed');
          });
          razorpayObject.open();
        } else {
          alert(res.msg);
        }
      }
    });
  });
});