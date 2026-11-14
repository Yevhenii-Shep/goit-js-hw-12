import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery, PER_PAGE } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

import errorIcon from './img/error.svg';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let totalPages = 0;

function showError(message) {
  iziToast.show({
    message,
    position: 'topRight',
    backgroundColor: '#ef4040',
    messageColor: '#fafafb',
    iconUrl: errorIcon,
    maxWidth: 432,
  });
}

function showEndMessage() {
  iziToast.info({
    message: "We're sorry, but you've reached the end of search results.",
    position: 'topRight',
  });
}

function updateLoadMore() {
  if (page >= totalPages) {
    hideLoadMoreButton();
    showEndMessage();
  } else {
    showLoadMoreButton();
  }
}

function scrollToNewImages() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

form.addEventListener('submit', async event => {
  event.preventDefault();

  const searchQuery = event.currentTarget.elements['search-text'].value.trim();

  if (searchQuery === '') {
    showError('Please enter a search query!');
    return;
  }

  query = searchQuery;
  page = 1;
  totalPages = 0;

  clearGallery();
  hideLoadMoreButton();
  showLoader();
  form.reset();

  try {
    const { hits, totalHits } = await getImagesByQuery(query, page);

    if (hits.length === 0) {
      showError(
        'Sorry, there are no images matching your search query. Please try again!'
      );
    } else {
      createGallery(hits);
      totalPages = Math.ceil(totalHits / PER_PAGE);
      updateLoadMore();
    }
  } catch {
    showError('Something went wrong. Please try again later!');
  } finally {
    hideLoader();
  }
});

loadMoreBtn.addEventListener('click', async () => {
  page += 1;

  hideLoadMoreButton();
  showLoader();

  try {
    const { hits } = await getImagesByQuery(query, page);

    createGallery(hits);
    scrollToNewImages();
    updateLoadMore();
  } catch {
    page -= 1;
    showLoadMoreButton();
    showError('Something went wrong. Please try again later!');
  } finally {
    hideLoader();
  }
});
