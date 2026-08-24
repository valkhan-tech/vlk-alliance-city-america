document.getElementById('year').textContent = new Date().getFullYear();

const heroCarousel = document.getElementById('hero-carousel');
if (heroCarousel) {
  const slides = heroCarousel.querySelectorAll('.hero-bg-slide');
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 6000);
}

const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mainNav.classList.remove('open'));
});

(function initTimeline() {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  const scrollEl = document.getElementById('timeline-scroll');
  const prevBtn = document.getElementById('timeline-prev');
  const nextBtn = document.getElementById('timeline-next');
  const items = Array.from(timeline.querySelectorAll('.timeline-item'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.3 });
  items.forEach(item => io.observe(item));

  let index = 0;
  let scrollEndTimer = null;

  const isDesktop = () => window.matchMedia('(min-width: 901px)').matches;
  const pos = (item) => isDesktop() ? item.offsetLeft : item.offsetTop;
  const scrollPos = () => isDesktop() ? scrollEl.scrollLeft : scrollEl.scrollTop;
  const maxScroll = () => isDesktop()
    ? scrollEl.scrollWidth - scrollEl.clientWidth
    : scrollEl.scrollHeight - scrollEl.clientHeight;

  function updateDisabled() {
    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= items.length - 1 || maxScroll() <= 2;
  }

  function goTo(i) {
    index = Math.max(0, Math.min(items.length - 1, i));
    const target = pos(items[index]);
    scrollEl.scrollTo(isDesktop() ? { left: target, behavior: 'smooth' } : { top: target, behavior: 'smooth' });
    updateDisabled();
  }

  function closestIndexToScroll() {
    let closest = 0;
    let smallestDiff = Infinity;
    items.forEach((item, i) => {
      const diff = Math.abs(pos(item) - scrollPos());
      if (diff < smallestDiff) { smallestDiff = diff; closest = i; }
    });
    return closest;
  }

  const VISIBLE_COUNT = 4.5;

  function sizeDesktopCards() {
    items.forEach(item => { item.style.flexBasis = ''; });
    if (items.length < 5) return;

    const itemsEl = scrollEl.querySelector('.timeline-items');
    const gap = parseFloat(getComputedStyle(itemsEl).columnGap) || 0;
    const available = scrollEl.clientWidth;
    const cardWidth = (available - gap * (VISIBLE_COUNT - 0.5)) / VISIBLE_COUNT;

    items.forEach(item => { item.style.flexBasis = Math.round(cardWidth) + 'px'; });
  }

  function sizeMobileImages() {
    items.forEach(item => {
      const img = item.querySelector('.timeline-card img');
      if (img) img.style.height = '';
    });
    if (items.length < 5) return;

    const itemsEl = scrollEl.querySelector('.timeline-items');
    const gap = parseFloat(getComputedStyle(itemsEl).rowGap) || 0;
    const available = scrollEl.clientHeight;

    const firstCard = items[0].querySelector('.timeline-card');
    const firstImg = firstCard.querySelector('img');
    const textHeight = firstCard.offsetHeight - firstImg.offsetHeight;

    const totalItemHeight = (available - gap * (VISIBLE_COUNT - 0.5)) / VISIBLE_COUNT;
    const imgHeight = Math.max(70, Math.round(totalItemHeight - textHeight));

    items.forEach(item => {
      const img = item.querySelector('.timeline-card img');
      if (img) img.style.height = imgHeight + 'px';
    });
  }

  function sizeTimeline() {
    if (isDesktop()) {
      items.forEach(item => {
        const img = item.querySelector('.timeline-card img');
        if (img) img.style.height = '';
      });
      sizeDesktopCards();
    } else {
      items.forEach(item => { item.style.flexBasis = ''; });
      sizeMobileImages();
    }
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));

  scrollEl.addEventListener('scroll', () => {
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => {
      index = closestIndexToScroll();
      updateDisabled();
    }, 120);
  }, { passive: true });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      sizeTimeline();
      updateDisabled();
    }, 150);
  });

  sizeTimeline();
  updateDisabled();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      sizeTimeline();
      updateDisabled();
    });
  }
})();

(function initTeamPodium() {
  const podium = document.getElementById('team-podium');
  if (!podium) return;

  const professors = [
    { name: 'Christian', role: 'Professor · Faixa-preta', photo: 'assets/img/professores/christian.jpeg' },
    { name: 'Mauricio', role: 'Professor · Faixa-preta', photo: 'assets/img/professores/mauricio.jpeg' },
    { name: 'Wallaf', role: 'Professor · Faixa-preta', photo: 'assets/img/professores/wallaf%202.jpeg' },
  ];

  const dotsEl = document.getElementById('podium-dots');
  professors.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'podium-dot';
    dot.setAttribute('aria-label', `Ver professor ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });
  const dots = Array.from(dotsEl.children);

  const slotEls = {
    prev: podium.querySelector('[data-slot="prev"]'),
    current: podium.querySelector('[data-slot="current"]'),
    next: podium.querySelector('[data-slot="next"]'),
  };

  let current = 0;
  const wrap = (i) => (i + professors.length) % professors.length;

  function fill(el, prof) {
    const photo = el.querySelector('.team-photo img');
    photo.src = prof.photo;
    photo.alt = `Professor ${prof.name}`;
    el.querySelector('h3').textContent = prof.name;
    el.querySelector('.team-role').textContent = prof.role;
  }

  function render() {
    fill(slotEls.prev, professors[wrap(current - 1)]);
    fill(slotEls.current, professors[current]);
    fill(slotEls.next, professors[wrap(current + 1)]);
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  }

  function goTo(i) {
    current = wrap(i);
    render();
  }

  document.getElementById('podium-prev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('podium-next').addEventListener('click', () => goTo(current + 1));
  slotEls.prev.addEventListener('click', () => goTo(current - 1));
  slotEls.next.addEventListener('click', () => goTo(current + 1));

  render();
})();

document.querySelectorAll('.family-card-link[data-nivel]').forEach(link => {
  link.addEventListener('click', () => {
    const select = document.querySelector('#contact-form select[name="nivel"]');
    if (select) select.value = link.dataset.nivel;
  });
});

const form = document.getElementById('contact-form');
const note = document.getElementById('form-note');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = form.nome.value.trim();
  const whatsapp = form.whatsapp.value.trim();
  const nivel = form.nivel.value;
  const texto = `Olá! Meu nome é ${nome} e quero agendar uma aula experimental na Alliance City América. Nível: ${nivel}. WhatsApp: ${whatsapp}`;
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  note.textContent = 'Abrindo o WhatsApp para finalizar seu agendamento...';
  window.open(url, '_blank', 'noopener');
});
