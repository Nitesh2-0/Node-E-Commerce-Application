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

/* Dynamically Add Products */
function addToCart(price, url, productName, quantity, offer) {
  const originalPrice = price - (price*(offer/100));
  const item = `
                <div class="product-entry flex mb-4">
                  <div class="w-full bg-gray-800 p-4 rounded-md flex flex-wrap justify-between items-center gap-10">
                    <div class="product-info flex-grow">
                      <h3 class="text-white font-semibold">Product Name: ${productName}</h3>
                      <p class="text-green-400 mt-2 mb-2">
                        <span class="text-white">Price :</span> ₹ ${price}
                      </p>
                      <input type="number" value="${quantity}" min="1"
                        class="text-white placeholder:text-white bg-green-600 px-4 py-1 rounded cursor-pointer w-16 quantity">
                      <a href="/feed/addToCart/show/${productName}">
                        <button class="remove-product-btn text-white bg-red-500 px-4 py-1 rounded cursor-pointer">Remove</button>
                      </a>
                    </div>
                    <div class="img-container flex-shrink-0 w-full md:h-[150px] md:w-[150px]" >
                      <img src="${url}" alt="${productName} Image" class="rounded w-full h-full object-cover">
                    </div>
                  </div>
                </div>
                `;
  document.querySelector('.product-list').innerHTML += item;
}

const parentElement = document.querySelector('.main');
if (parentElement) {
  parentElement.addEventListener("click", function (event) {
    if (event.target.classList.contains('addBtn')) {
      handlingAddToCartBtn(event);
    }
  });
}

function handlingAddToCartBtn(event) {
  const button = event.target;
  const product = button.closest('.cartFrame');
  if (product) {
    const item = {
      productName: product.querySelector('.contsPname').textContent,
      price: parseInt(product.querySelector('.price').textContent.slice(1).trim()),
      productImg: product.querySelector('img').src
    };
    productAvilable.textContent = parseInt(productAvilable.textContent) + 1;

    axios.post('/feed/addToCart', item)
      .then(response => {
        const res = response.data;
        window.location.reload();
      })
      .catch(error => {
        console.log(error);
        alert('Something went wrong');
      });
  } else {
    alert('Product Not Found')
  }
}

function fetchAndDisplayCartItems() {
  let cost = 0;
  axios.get('/feed/addToCart/show')
    .then(response => {
      const cartItems = response.data;
      cartItems.forEach((item, idx) => {
        cost += item.price;
        addToCart(item.price, item.productImg, item.productName, item.quantity,item.offer);
      });
      productAvilable.textContent = `${cartItems.length}`;
    }).then(() => {
      document.querySelector('.totalAmount').innerHTML = cost
      document.querySelector('#totals').value = cost
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

window.onload = fetchAndDisplayCartItems;

/* Web-Site Loader */
window.addEventListener('load', () => {
  document.getElementById('loader').classList.add('hidden');
  document.getElementById('loader-background').classList.add('hidden');
});

let flg = true;
const account = document.getElementById('profileSection');

document.getElementById('profile-btn').addEventListener('click', () => {
  if (!flg) {
    account.classList.remove('hidden');
    flg = true;
  } else {
    account.classList.add('hidden');
    flg = false;
  }
});

document.getElementById('profileCloser').addEventListener('click', () => {
  account.classList.add('hidden');
});

document.querySelectorAll('.productImg').forEach((elm) => {
  elm.addEventListener('click', async () => {
    const productId = elm.getAttribute('productId');
    console.log('Img Clicked', productId);
    try {
      window.location.href = `/feed/cart/${productId}`;
      console.log('Response:', response.data); 
    } catch (error) {
      console.log('Error:', error);
    }
  });
});


const searchBtn = document.getElementById('serach'); 
searchBtn.addEventListener('click', async (req,res) => {
  const serchItem = document.getElementById('serachData'); 
  const product_name = serchItem.value
  try {
    axios.post('/feed/item/searching', {searchString:product_name})
    .then((response) => {
      const {data} = response.data;
      console.log(data);
    })
    .catch((err) => console.log(err));
  } catch (error) {
    alert('Something Wrong')
  }
})