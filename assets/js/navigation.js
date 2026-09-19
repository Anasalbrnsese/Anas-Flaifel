export function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggle = header.querySelector('.menu-toggle');
  const nav = header.querySelector('nav');
  const mobile = window.matchMedia('(max-width: 760px)');
  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('menu-open', open);
  }
  toggle.hidden = false;
  header.classList.add('enhanced');
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    setOpen(false);
    if (mobile.matches) {
      const target = document.querySelector(link.getAttribute('href'));
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
  });
  header.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });
  mobile.addEventListener('change', () => setOpen(false));
  // The current destination follows native anchor navigation, including browser Back.
  const markDestination = () => {
    nav.querySelectorAll('a').forEach((link) => {
      if (link.hash === location.hash) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  window.addEventListener('hashchange', markDestination);
  markDestination();
}

