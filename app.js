"use strict";

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.getElementById('main-nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
  mainNav.dataset.open = 'false';
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  mainNav.dataset.open = String(open);
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});

const search = document.getElementById('law-search');
const clearSearch = document.getElementById('clear-search');
const rows = Array.from(document.querySelectorAll('.law-row'));
const filters = Array.from(document.querySelectorAll('[data-filter]'));
const results = document.getElementById('law-results');
const empty = document.getElementById('empty-results');
const more = document.getElementById('load-more');
const PAGE_SIZE = 8;
let category = 'all';
let limit = PAGE_SIZE;
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const searchable = new Map(rows.map(row => [row, normalize(row.dataset.search)]));

function applyFilters() {
  const words = normalize(search.value).split(/\s+/).filter(Boolean);
  const matched = rows.filter(row => (category === 'all' || row.dataset.category === category) && words.every(word => searchable.get(row).includes(word)));
  const visible = new Set(matched.slice(0, limit));
  rows.forEach(row => { row.hidden = !visible.has(row); });
  const shown = Math.min(limit, matched.length);
  results.textContent = matched.length ? `${shown} de ${matched.length} normas` : '0 normas';
  empty.hidden = matched.length > 0;
  more.hidden = shown >= matched.length;
  more.textContent = `Ver ${Math.min(PAGE_SIZE, matched.length - shown)} normas más ↓`;
  clearSearch.hidden = search.value.length === 0;
}
search.addEventListener('input', () => { limit = PAGE_SIZE; applyFilters(); });
clearSearch.addEventListener('click', () => { search.value = ''; limit = PAGE_SIZE; applyFilters(); search.focus(); });
filters.forEach(button => button.addEventListener('click', () => {
  category = button.dataset.filter;
  limit = PAGE_SIZE;
  filters.forEach(item => {
    const selected = item === button;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  applyFilters();
}));
more.addEventListener('click', () => { limit += PAGE_SIZE; applyFilters(); });
applyFilters();

// Facilita imprimir el contenido completo y recupera el estado de lectura después.
let closedBeforePrint = [];
window.addEventListener('beforeprint', () => {
  closedBeforePrint = Array.from(document.querySelectorAll('details:not([open])'));
  closedBeforePrint.forEach(detail => { detail.open = true; });
});
window.addEventListener('afterprint', () => {
  closedBeforePrint.forEach(detail => { detail.open = false; });
  closedBeforePrint = [];
});
