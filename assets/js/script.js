document.getElementById('year').textContent = new Date().getFullYear();

// --- Google Analytics (gtag) — eventos de clique em contato ---
function trackEvent(name, params) {
  if (typeof gtag === 'function') {
    gtag('event', name, params || {});
  }
}

// Delegação de clique: cobre links de WhatsApp e e-mail existentes e os que forem adicionados depois.
document.addEventListener('click', (e) => {
  const whatsappLink = e.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
  if (whatsappLink) {
    trackEvent('click_whatsapp', { link_url: whatsappLink.href });
    return;
  }

  const emailLink = e.target.closest('a[href^="mailto:"]');
  if (emailLink) {
    trackEvent('click_email', { link_url: emailLink.href });
  }
});

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

  function resetMobileImages() {
    items.forEach(item => {
      const img = item.querySelector('.timeline-card img');
      if (img) img.style.height = '';
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
      resetMobileImages();
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

  const track = document.getElementById('podium-track');
  const dotsEl = document.getElementById('podium-dots');
  const prevButton = document.getElementById('podium-prev');
  const nextButton = document.getElementById('podium-next');

  const professors = [
    { name: 'Alexandre', role: 'Professor · Faixa-preta', photo: 'assets/img/professores/alexandre.jpeg' },
    { name: 'Christian', role: 'Professor · Faixa-preta', photo: 'assets/img/professores/christian.jpeg' },
    { name: 'Mauricio', role: 'Professor · Faixa-preta', photo: 'assets/img/professores/mauricio.jpeg' },
    { name: 'Wallaf', role: 'Professor · Faixa-marrom', photo: 'assets/img/professores/wallaf%202.jpeg' },
  ];

  const wrap = (i) => (i + professors.length) % professors.length;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  dotsEl.replaceChildren();
  professors.forEach((professor, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'podium-dot';
    dot.setAttribute('aria-label', `Ver professor ${professor.name}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });
  const dots = Array.from(dotsEl.children);

  const slider = document.createElement('div');
  slider.className = 'podium-slider no-transition';
  const carouselBuffer = 2;
  const carouselIndexes = [
    ...Array.from({ length: carouselBuffer }, (_, i) => wrap(i - carouselBuffer)),
    ...professors.map((_, i) => i),
    ...Array.from({ length: carouselBuffer }, (_, i) => i),
  ];

  carouselIndexes.forEach((professorIndex) => {
    const professor = professors[professorIndex];
    const card = document.createElement('article');

    card.className = 'podium-card';
    card.dataset.professor = professorIndex;
    card.innerHTML = `
      <div class="team-photo"><img src="${professor.photo}" alt="Professor ${professor.name}" draggable="false"></div>
      <h3>${professor.name}</h3>
      <p class="team-role">${professor.role}</p>
    `;
    card.addEventListener('click', () => goTo(professorIndex));
    slider.appendChild(card);
  });

  track.replaceChildren(slider);
  const cards = Array.from(slider.children);
  let current = 0;
  let position = carouselBuffer;
  let isAnimating = false;

  function updateState() {
    cards.forEach((card, i) => {
      const isActive = i === position;
      card.classList.toggle('is-active', isActive);
      card.classList.toggle('is-adjacent', Math.abs(i - position) === 1);
      card.setAttribute('aria-hidden', String(!isActive));
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  }

  function positionSlider(animate = true) {
    slider.classList.toggle('no-transition', !animate);
    const activeCard = cards[position];
    const offset = (track.clientWidth / 2) - (activeCard.offsetLeft + activeCard.offsetWidth / 2);
    slider.style.transform = `translate3d(${offset}px, 0, 0)`;

    if (!animate) {
      slider.getBoundingClientRect();
      slider.classList.remove('no-transition');
    }
  }

  function finishLoop() {
    const crossedStart = position === carouselBuffer - 1;
    const crossedEnd = position === carouselBuffer + professors.length;

    if (crossedStart || crossedEnd) {
      slider.classList.add('no-transition');
      position = crossedStart
        ? carouselBuffer + professors.length - 1
        : carouselBuffer;
      updateState();
      positionSlider(false);
    }

    isAnimating = false;
  }

  function move(step) {
    if (isAnimating) return;
    isAnimating = true;
    position += step;
    current = wrap(current + step);
    updateState();
    positionSlider(!prefersReducedMotion.matches);
    if (prefersReducedMotion.matches) finishLoop();
  }

  function goTo(index) {
    const target = wrap(index);
    if (target === current || isAnimating) return;

    if (current === 0 && target === professors.length - 1) position = carouselBuffer - 1;
    else if (current === professors.length - 1 && target === 0) position = carouselBuffer + professors.length;
    else position = target + carouselBuffer;

    current = target;
    isAnimating = true;
    updateState();
    positionSlider(!prefersReducedMotion.matches);
    if (prefersReducedMotion.matches) finishLoop();
  }

  slider.addEventListener('transitionend', (event) => {
    if (event.target === slider && event.propertyName === 'transform') finishLoop();
  });
  prevButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));
  window.addEventListener('resize', () => {
    finishLoop();
    positionSlider(false);
  });

  updateState();
  positionSlider(false);
})();

document.querySelectorAll('.family-card-link[data-nivel]').forEach(link => {
  link.addEventListener('click', () => {
    const select = document.querySelector('#contact-form select[name="nivel"]');
    if (select) select.value = link.dataset.nivel;
  });
});

const form = document.getElementById('contact-form');
const note = document.getElementById('form-note');
const formLoadedAtField = document.getElementById('form_loaded_at');
const whatsappField = form.querySelector('input[name="whatsapp"]');

function formatWhatsapp(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const firstPart = digits.slice(2, 7);
  const lastPart = digits.slice(7);

  return `(${ddd}) ${firstPart}${lastPart ? `-${lastPart}` : ''}`;
}

whatsappField.addEventListener('input', () => {
  whatsappField.value = formatWhatsapp(whatsappField.value);
});

// Marca o instante em que o formulário ficou visível, usado no back-end
// como trava de tempo mínimo de preenchimento (proteção anti-bot).
if (formLoadedAtField) {
  formLoadedAtField.value = Math.floor(Date.now() / 1000);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = form.nome.value.trim();
  const whatsapp = form.whatsapp.value.trim();
  const nivel = form.nivel.value;
  const periodo = form.periodo.options[form.periodo.selectedIndex].text;

  if (nome.length < 2 || whatsapp.replace(/\D/g, '').length !== 11) {
    note.textContent = 'Preencha seu nome e um WhatsApp válido com DDD e 11 dígitos.';
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  note.textContent = 'Enviando...';
  trackEvent('click_form', { form_id: 'contact-form' });

  try {
    const response = await fetch('contact.php', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form),
    });
    const data = await response.json();
    note.textContent = data.message || 'Recebemos seus dados!';

    if (data.ok) {
      form.reset();
      if (formLoadedAtField) formLoadedAtField.value = Math.floor(Date.now() / 1000);

      const texto = `Olá! Meu nome é ${nome} e quero agendar uma aula experimental na Alliance City América. Nível: ${nivel}. Período de preferência: ${periodo}. WhatsApp: ${whatsapp}`;
      const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
      trackEvent('click_whatsapp', { link_url: url, source: 'contact-form' });
      window.open(url, '_blank', 'noopener');
    }
  } catch (err) {
    note.textContent = 'Não foi possível enviar agora. Tente novamente em instantes.';
  } finally {
    submitBtn.disabled = false;
  }
});
