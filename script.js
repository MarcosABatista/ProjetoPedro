const backToTopIcon = document.querySelector('.back-to-top')

function backToTop() {
  if (window.scrollY >= 10) {
    backToTopIcon.classList.add('show')
  } else {
    backToTopIcon.classList.remove('show')
  }
}
