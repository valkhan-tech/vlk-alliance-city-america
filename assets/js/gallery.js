(() => {
  const gallery = document.getElementById('galeria');
  const dialog = document.getElementById('gallery-dialog');
  if (!gallery || !dialog || typeof dialog.showModal !== 'function') return;

  const items = [...gallery.querySelectorAll('.gallery-item')];
  const filters = [...gallery.querySelectorAll('[data-filter]')];
  const count = gallery.querySelector('.gallery-count');
  const image = document.getElementById('gallery-full-image');
  const source = document.getElementById('gallery-full-source');
  const caption = document.getElementById('gallery-dialog-caption');
  const position = document.getElementById('gallery-position');
  let visible = items;
  let current = 0;
  let opener;

  gallery.querySelector('.gallery-filters').hidden = false;
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    items.forEach(item => {
      item.hidden = button.dataset.filter !== 'todas' && item.dataset.category !== button.dataset.filter;
    });
    visible = items.filter(item => !item.hidden);
    count.textContent = `${visible.length} fotos · ${button.textContent}`;
  }));

  function show(index) {
    current = (index + visible.length) % visible.length;
    const item = visible[current];
    const link = item.querySelector('a');
    const thumb = item.querySelector('img');
    image.width = thumb.width ? Number(thumb.getAttribute('width')) : 1600;
    image.height = Number(thumb.getAttribute('height'));
    image.alt = thumb.alt;
    source.srcset = link.dataset.webp;
    image.src = link.href;
    caption.textContent = item.querySelector('figcaption p').textContent;
    position.textContent = `${current + 1} de ${visible.length}`;
  }

  items.forEach(item => item.querySelector('a').addEventListener('click', event => {
    // Keep native open-in-new-tab and download behavior.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = event.currentTarget;
    show(visible.indexOf(item));
    dialog.showModal();
    document.body.classList.add('modal-open');
    dialog.querySelector('.gallery-close').focus();
  }));
  dialog.querySelector('.gallery-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.gallery-prev').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.gallery-next').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (opener) opener.focus();
  });
})();
