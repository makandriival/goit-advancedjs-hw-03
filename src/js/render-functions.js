import SimpleLightboxModule from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const gallery = document.querySelector('.gallery');
const loading = document.querySelector('.loading');
const SimpleLightbox = SimpleLightboxModule.default;
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]
  );
}

export function createGallery(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<li class="gallery-item">
          <a class="gallery-link" href="${escapeHtml(largeImageURL)}">
            <img class="gallery-image" src="${escapeHtml(webformatURL)}"
              alt="${escapeHtml(tags)}" width="360" height="200" loading="lazy" />
            <div class="image-info">
              <p><strong>Likes</strong><span>${escapeHtml(likes)}</span></p>
              <p><strong>Views</strong><span>${escapeHtml(views)}</span></p>
              <p><strong>Comments</strong><span>${escapeHtml(comments)}</span></p>
              <p><strong>Downloads</strong><span>${escapeHtml(downloads)}</span></p>
            </div>
          </a>
        </li>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

export function clearGallery() {
  gallery.innerHTML = '';
  lightbox.refresh();
}

export function showLoader() {
  loading.classList.add('is-visible');
  loading.setAttribute('aria-hidden', 'false');
  gallery.setAttribute('aria-busy', 'true');
}

export function hideLoader() {
  loading.classList.remove('is-visible');
  loading.setAttribute('aria-hidden', 'true');
  gallery.setAttribute('aria-busy', 'false');
}
