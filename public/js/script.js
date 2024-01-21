let price_input = document.getElementById("intro__price-text-input");
let price_block = document.getElementById("intro__price");
let price = document.getElementById("intro__price-text-span");
let slider = document.getElementById("myRange");
let localStorageDate = localStorage["price"];

(() => {
  function setCookie(name, value, options = {}) {
    options = {
      path: '/',
      // при необходимости добавьте другие значения по умолчанию
      ...options
    };

    if (options.expires instanceof Date) {
      options.expires = options.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
      updatedCookie += "; " + optionKey;
      let optionValue = options[optionKey];
      if (optionValue !== true) {
        updatedCookie += "=" + optionValue;
      }
    }

    document.cookie = updatedCookie;
  }

  const qs = new URLSearchParams(window.location.search);
  const storage = window.localStorage;

  if (qs.get("fbpix")) {
    storage.setItem("fbpix", qs.get("fbpix"));
    storage.setItem("buyer", qs.get("buyer"));
  }
  if (qs.get("buyer")) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 365);
    setCookie('buyer', qs.get("buyer"), { expires: expires });
  }
})();

if (performance.navigation.type == 2) {
  location.reload(true);
}

var numberMask = IMask(price_input, {
  mask: Number,
  min: 3000,
  max: 250000,
  thousandsSeparator: " ",
});

function collapseOpen(el) {
  let parentEl = document.getElementById(el.parentElement.id);
  parentEl.classList.toggle("open");
}

let btns = document.querySelectorAll(".collapse__item-title");
btns.forEach((btn) => {
  btn.addEventListener("click", () => {
    collapseOpen(btn);
  });
});

function rangePrice() {
  let rng = document.getElementById("myRange");
  price.innerHTML = rng.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function changePrice() {
  price_block.classList.toggle("edit");
  // price_input.value = +price.innerHTML.replace(/\s/g, "").slice(0, -1);
  numberMask.value = price.innerHTML.replace(/\s/g, "");
  price_input.focus();
}

function changeInput() {
  numberMask.value = price.innerHTML.replace(/\s/g, "");
}

price_block.addEventListener(
  "blur",
  function (event) {
    price_block.classList.toggle("edit");
    price.innerHTML = event.target.value
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    slider.style = `--value: ${event.target.value.replace(
      /\s/g,
      ""
    )}; --min:3000; --max:250000`;
    slider.value = +event.target.value.replace(/\s/g, "");
  },
  true
);

function openMenu() {
  let menu = document.getElementById("header__nav-btn");
  menu.classList.toggle("open");
}

function buttonClick() {
  localStorage.setItem("price", price_input.value);
}
