import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import './css/styles.css';
import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
} from './js/render-functions.js';

const form = document.querySelector('.form');
const input = form.elements.namedItem('search-text');
const submitButton = form.querySelector('button');
let isLoading = false;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (isLoading) return;

  const query = input.value.trim();
  if (!query) {
    iziToast.warning({
      message: 'Please enter a search query.',
      position: 'bottomRight',
    });
    input.focus();
    return;
  }

  clearGallery();
  showLoader();
  isLoading = true;
  submitButton.disabled = true;

  getImagesByQuery(query)
    .then((data) => {
      if (!Array.isArray(data.hits)) {
        throw new Error('The image service returned an invalid response.');
      }
      if (data.hits.length === 0) {
        iziToast.error({
          message:
            'Sorry, there are no images matching your search query. Please try again!',
          position: 'bottomRight',
        });
        return;
      }
      createGallery(data.hits);
    })
    .catch((error) => {
      iziToast.error({
        title: 'Search failed',
        message:
          error.code === 'MISSING_API_KEY'
            ? error.message
            : 'Unable to load images. Please check your connection and try again.',
        position: 'bottomRight',
      });
    })
    .finally(() => {
      hideLoader();
      isLoading = false;
      submitButton.disabled = false;
    });
});
