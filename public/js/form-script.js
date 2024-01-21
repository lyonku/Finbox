let price_input = document.getElementById("intro__price-text-input");
let price_block = document.getElementById("intro__price");
let price = document.getElementById("intro__price-text-span");
let slider = document.getElementById("myRange");
let localStorageDate = localStorage["price"];

let form = document.querySelector(".intro__form");
let validateBtn = form.querySelector(".intro__button");
let personName = form.querySelector(".intro__form-name");
let nameError = form.querySelector(".name-error");
let email = form.querySelector(".intro__form-email");
let emailError = form.querySelector(".email-error");
let phone = form.querySelector(".intro__form-phone");
let phoneError = form.querySelector(".phone-error");
let checkbox = form.querySelector(".intro__checkbox");
let checkboxError = form.querySelector(".checkbox-error");
let correctEmail = document.getElementById("intro__input-correctEmail");
let correctEmailValue = document.getElementById(
  "intro__input-correctEmail-email"
);
let introLoader = document.getElementById("intro__loader");
let introButton = document.getElementById("intro__button");

async function validateServerEmail(email) {
  introButton.style.display = "none";
  introLoader.style.display = "flex";
  const requestURL = `/validate-email?email=${email}`;
  let res = await fetch(requestURL, { method: "GET" });
  introLoader.style.display = "none";
  introButton.style.display = "block";

  return res;
}

function changeToCorrectEmail() {
  email.value = correctEmailValue.textContent;
  correctEmail.classList.remove("emailError");
  emailError.classList.remove("error");
}

(() => {
  function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }
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
  function generateId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }


  const userId = (() => {
    let id = getCookie('userId')
    if (id) {
      window.localStorage.setItem('userId', id);
      return id;
    }
    id = generateId(12);

    const expires = new Date();
    expires.setDate(expires.getDate() + 365);

    setCookie('userId', id, { expires: expires });
    window.localStorage.setItem('userId', id);

    return id;
  })();

  try {
    ym(90202415, 'setUserID', userId);

    gtag('config', 'G-QPL9ZHL2KN', {
      'user_id': userId
    });
  } catch (e) {
    console.error(e)
  }

  const buyer = window.localStorage.getItem("buyer");
  if (buyer) {
    const form = document.getElementById("form");
    const action = form.attributes.getNamedItem("action");

    const qs = new URLSearchParams();
    qs.append("buyer", buyer);
    qs.append("fbpix", window.localStorage.getItem("fbpix"));
    qs.append("userId", userId);

    action.value = action.value + "?" + qs.toString();
  }
})();

if (localStorageDate) {
  price.innerHTML = localStorageDate;
  slider.style = `--value: ${localStorageDate.replace(
    /\s/g,
    ""
  )}; --min:3000; --max:250000`;
  slider.value = +localStorageDate.replace(/\s/g, "");
}

var numberMask = IMask(price_input, {
  mask: Number,
  min: 3000,
  max: 250000,
  thousandsSeparator: " ",
});

var phoneMask = IMask(document.getElementById("intro__form-phone"), {
  mask: "(700)-000-0000",
  lazy: false,
});

function rangePrice() {
  let rng = document.getElementById("myRange");
  localStorage.setItem(
    "price",
    rng.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  );

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

// validation start

function validateEmail(email) {
  let re = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/;
  return re.test(String(email).toLowerCase());
}

function validatePhone(str) {
  let result = [];
  let rr = [];
  [...str].map((i) => {
    if (isFinite(i) == true) {
      result.push(i);
    } else {
      rr.push(i);
    }
  });
  return result;
}

function validateName(name) {
  let re = /^[а-яА-ЯёЁA-Za-z ]+$/;
  return re.test(String(name).toLowerCase());
}
// Autovalidate start
personName.onblur = function () {
  nameError.classList.remove("error");
  if (personName.value) {
    if (!validateName(personName.value)) {
      nameError.classList.add("error");
      nameError.textContent = "Не может содержать символы";
    }
  } else {
    nameError.classList.add("error");
    nameError.textContent = "Поле обязательно для заполнения";
  }
};

personName.onfocus = function () {
  nameError.classList.remove("error");
};

email.onblur = function () {
  emailError.classList.remove("error");
  if (email.value) {
    if (!validateEmail(email.value)) {
      emailError.textContent = "Некорректный email";
      emailError.classList.add("error");
    }
  } else {
    emailError.textContent = "Поле обязательно для заполнения";
    emailError.classList.add("error");
  }
};

email.onfocus = function () {
  emailError.classList.remove("error");
};

phone.onblur = function () {
  phoneError.classList.remove("error");
  let phoneLength = validatePhone(phone.value).length;
  if (phoneLength > 1) {
    if (phoneLength < 10) {
      phoneError.classList.add("error");
      phoneError.textContent = "Некорректный номер";
    }
  } else {
    phoneError.classList.add("error");
    phoneError.textContent = "Поле обязательно для заполнения";
  }
};

phone.onfocus = function () {
  phoneError.classList.remove("error");
};

checkbox.onclick = function () {
  if (checkbox.checked) {
    checkboxError.classList.remove("error");
  } else {
    checkboxError.classList.add("error");
    checkboxError.textContent =
      "Требуется согласие на обработку персональных данных";
  }
};
// Autovalidate end

form.onsubmit = function (e) {
  let errors = [];

  e.preventDefault();

  nameError.classList.remove("error");
  emailError.classList.remove("error");
  phoneError.classList.remove("error");
  checkboxError.classList.remove("error");
  correctEmail.classList.remove("emailError");

  let phoneLength = validatePhone(phone.value).length;
  if (phoneLength > 1) {
    if (phoneLength < 10) {
      errors.push({ field: "phone", message: "Некорректный номер" });
    }
  } else {
    errors.push({ field: "phone", message: "Поле обязательно для заполнения" });
    phone.focus();
  }

  if (email.value) {
    if (!validateEmail(email.value)) {
      errors.push({ field: "email", message: "Некорректный email" });
    }
  } else {
    errors.push({ field: "email", message: "Поле обязательно для заполнения" });
    email.focus();
  }

  if (personName.value) {
    if (!validateName(personName.value)) {
      errors.push({
        field: "name",
        message: "Не может содержать символы",
      });
    }
  } else {
    errors.push({ field: "name", message: "Поле обязательно для заполнения" });
    personName.focus();
  }
  if (checkbox.checked) {
  } else {
    errors.push({
      field: "checkbox",
      message: "Требуется согласие на обработку персональных данных",
    });
  }

  //

  if (errors.length > 0) {
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      if (error.field == "name") {
        nameError.classList.add("error");
        nameError.textContent = error.message;
      }
      if (error.field == "email") {
        emailError.classList.add("error");
        emailError.textContent = error.message;
      }
      if (error.field == "phone") {
        phoneError.classList.add("error");
        phoneError.textContent = error.message;
      }
      if (error.field == "checkbox") {
        checkboxError.classList.add("error");
        checkboxError.textContent = error.message;
      }
    }
    return false;
  }

  validateServerEmail(email.value)
    .then((result) => result.json())
    .then((result) => {
      if (result.status === "invalid") {
        emailError.classList.add("error");
        emailError.textContent = "Некорректный email";
        if (result.didYouMean) {
          correctEmail.classList.add("emailError");
          correctEmailValue.textContent = result.didYouMean;
        }
      } else {
        document.getElementById('js-email-status').value = result.status;
        form.submit();
      }
    });
};

// validation end
