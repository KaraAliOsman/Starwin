document.addEventListener('DOMContentLoaded', () => {
  // Cargar Header
  fetch('header.html')
    .then(response => response.text())
    .then(html => {
      const placeholder = document.getElementById('header-placeholder');
      if (placeholder) {
        placeholder.outerHTML = html;
        marcarActivo();
      }
    });

  // Cargar Footer
  fetch('footer.html')
    .then(response => response.text())
    .then(html => {
      const placeholder = document.getElementById('footer-placeholder');
      if (placeholder) {
        placeholder.outerHTML = html;
        actualizarYear();
      }
    });

  function marcarActivo() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav .nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === path) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function actualizarYear() {
    const span = document.getElementById('current-year');
    if (span) span.textContent = new Date().getFullYear();
  }
});
