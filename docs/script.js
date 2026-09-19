const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const cartCount = document.querySelector('.cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const filterButtons = document.querySelectorAll('.filter-button');
const productCards = document.querySelectorAll('.product-card');
const toast = document.getElementById('toast');
const newsletterForm = document.querySelector('.newsletter-form');

let itemCount = 0;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

if (navToggle && header) {
  navToggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  header.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      header.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

addToCartButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const productName = button.dataset.product || 'Item';
    itemCount += 1;
    if (cartCount) {
      cartCount.textContent = String(itemCount);
    }
    showToast(`${productName} added to cart`);
  });
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.toggle('active', item === button));

    productCards.forEach((card) => {
      const category = card.dataset.category;
      const matches = filter === 'all' || category === filter;
      card.classList.toggle('is-hidden', !matches);
    });
  });
});

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('You are subscribed to Northstar updates!');
    newsletterForm.reset();
  });
}
