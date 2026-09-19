const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');

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

const details = document.querySelectorAll('.faq-list details');
details.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    details.forEach((other) => {
      if (other !== item) other.removeAttribute('open');
    });
  });
});
