function openMenu() {
  let menu = document.getElementById("header__nav-btn");
  menu.classList.toggle("open");
}

localStorage.removeItem("price");

(() => {
  const qs = new URLSearchParams(document.location.search);
  const userId = qs.get('userId') ?? qs.get('aff_sub2');

  try {
    ym(90202415, 'setUserID', userId);
    gtag('config', 'G-QPL9ZHL2KN', {
      'user_id': userId
    });
  } catch (e) {
    console.error(e)
  }
})();

(() => {
  const buyer = window.localStorage.getItem('buyer');
  const fbpix = window.localStorage.getItem('fbpix');

  if (!fbpix) {
    return;
  }

  window.localStorage.setItem('redirectToDetails', 'yes');

  document.querySelectorAll('.js-offer-link').forEach((el) => {
    el.addEventListener('click', () => {
      const img = new Image();
      img.src = `https://www.facebook.com/tr?id=${fbpix}&ev=AddToCart&noscript=1`;
    })
  })
})();
