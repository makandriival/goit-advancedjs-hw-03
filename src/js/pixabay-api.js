import axios from 'axios';

export function getImagesByQuery(query) {
  const key = import.meta.env.VITE_PIXABAY_API_KEY?.trim();

  if (!key) {
    const error = new Error(
      'Pixabay API key is missing. Configure VITE_PIXABAY_API_KEY and rebuild the app.'
    );
    error.code = 'MISSING_API_KEY';
    return Promise.reject(error);
  }

  return axios
    .get('https://pixabay.com/api/', {
      params: {
        key,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
      },
      timeout: 15000,
    })
    .then((response) => response.data);
}
