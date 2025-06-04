window.addEventListener('DOMContentLoaded', function () {
  const toggler = document.querySelector('.navbar-toggler');
  const nav = document.getElementById('navbarNav');
  if (toggler && nav) {
    toggler.addEventListener('click', function () {
      nav.classList.toggle('hidden');
    });
    const links = nav.querySelectorAll('a.nav-link');
    links.forEach(link => link.addEventListener('click', () => nav.classList.add('hidden')));
  }

  document.querySelectorAll('.nav-item.dropdown').forEach(item => {
    const toggle = item.querySelector('.dropdown-toggle');
    const menu = item.querySelector('.dropdown-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        menu.classList.toggle('show');
      });
      document.addEventListener('click', function(e){
        if(!item.contains(e.target)) menu.classList.remove('show');
      });
    }
  });

  const yearSpan = document.getElementById('current-year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});
