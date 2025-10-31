const lightbox = document.getElementById('imageLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeBtn = document.getElementById('closeLightbox');
const openBtn = document.getElementById('openInNewTab');

document.querySelectorAll('#awards .card img, #projects .card img').forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

closeBtn.addEventListener('click', () => {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
});

openBtn.addEventListener('click', () => {
  if (lightboxImg.src) window.open(lightboxImg.src, '_blank');
});

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
});
