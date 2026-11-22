document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.header-nav');
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      menu.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menu.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }));
  }

  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const answer = document.getElementById(button.getAttribute('aria-controls'));
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      answer.hidden = !open;
    });
  });

  const filters = document.querySelectorAll('[data-filter]');
  const galleryItems = [...document.querySelectorAll('.gallery-item')];
  const lightbox = document.querySelector('.lightbox');
  let activeItems = galleryItems;
  let currentIndex = 0;
  let lastFocused = null;
  filters.forEach(filter => filter.addEventListener('click', () => {
    const category = filter.dataset.filter;
    filters.forEach(btn => {
      btn.classList.toggle('active', btn === filter);
      btn.setAttribute('aria-pressed', String(btn === filter));
    });
    galleryItems.forEach(item => { item.hidden = category !== 'all' && item.dataset.category !== category; });
    activeItems = galleryItems.filter(item => !item.hidden);
  }));
  function showImage(index) {
    currentIndex = (index + activeItems.length) % activeItems.length;
    const source = activeItems[currentIndex];
    lightbox.querySelector('img').src = source.querySelector('img').src;
    lightbox.querySelector('img').alt = source.querySelector('img').alt;
    lightbox.querySelector('figcaption').textContent = source.dataset.caption;
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lastFocused) lastFocused.focus();
  }
  if (lightbox) {
    galleryItems.forEach(item => item.addEventListener('click', () => {
      lastFocused = item;
      activeItems = galleryItems.filter(el => !el.hidden);
      showImage(activeItems.indexOf(item));
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      lightbox.querySelector('.close').focus();
    }));
    lightbox.querySelector('.close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.prev').addEventListener('click', () => showImage(currentIndex - 1));
    lightbox.querySelector('.next').addEventListener('click', () => showImage(currentIndex + 1));
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
      if (e.key === 'Tab') {
        const controls = [...lightbox.querySelectorAll('button')];
        const first = controls[0], last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  const inquiry = document.querySelector('#inquiry-form');
  if (inquiry) {
    const params = new URLSearchParams(location.search);
    const room = params.get('room');
    if (room && inquiry.elements.room) {
      const option = [...inquiry.elements.room.options].find(option => option.value.toLowerCase() === room.toLowerCase());
      if (option) inquiry.elements.room.value = option.value;
    }
    const arrival = inquiry.elements.arrival;
    const departure = inquiry.elements.departure;
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    arrival.min = localToday;
    departure.min = localToday;
    arrival.addEventListener('change', () => { departure.min = arrival.value || localToday; if (departure.value && departure.value <= arrival.value) departure.value = ''; });
    inquiry.addEventListener('submit', e => {
      e.preventDefault();
      const status = inquiry.querySelector('.form-status');
      if (!inquiry.reportValidity()) return;
      if (arrival.value && departure.value && departure.value <= arrival.value) {
        status.textContent = 'Departure must be after arrival.';
        departure.focus();
        return;
      }
      const data = new FormData(inquiry);
      const subject = `Aurelia Hotel inquiry — ${data.get('room') || 'General'}`;
      const body = [
        'Hello Aurelia team,',
        '',
        `Name: ${data.get('name')}`,
        `Email: ${data.get('email')}`,
        `Room: ${data.get('room') || 'No preference'}`,
        `Arrival: ${data.get('arrival') || 'Flexible'}`,
        `Departure: ${data.get('departure') || 'Flexible'}`,
        `Guests: ${data.get('guests') || 'Not specified'}`,
        '',
        `Message: ${data.get('message') || 'I would like to learn more about availability.'}`,
        '',
        'Please let me know what is available. Thank you.'
      ].join('\n');
      status.textContent = 'Your email application will open with your inquiry ready to review. Nothing has been sent or reserved yet.';
      window.location.href = `mailto:stay@aureliahotel.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
});