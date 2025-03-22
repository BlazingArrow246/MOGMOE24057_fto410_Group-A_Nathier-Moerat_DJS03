//__________________________________________Import Data___________________________________________
import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

//____________________Initial starting page and book matches(initially set to all books)__________
let page = 1;
let matches = books

//_________________________Utility function to create and append elements_________________________
const createElement = (tag, attributes = {}, innerHTML = '') => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    element.innerHTML = innerHTML;
    return element;
};

// Handles element creation and attribute setting
// Replaces all document.createElement calls.

//_______________________________Function to render book previews_________________________________
const renderBooks = (bookList) => {
    const fragment = document.createDocumentFragment();
    for (const { author, id, image, title } of bookList) {
        const bookElement = createElement('button', { class: 'preview', 'data-preview': id }, `
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `);
        fragment.appendChild(bookElement);
    }
    document.querySelector('[data-list-items]').appendChild(fragment);
};

// Handles the repeated logic of rendering book previews across multiple event listeners.

//_______________________________Function to populate dropdowns___________________________________
const populateDropdown = (selector, options, defaultText) => {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(createElement('option', { value: 'any' }, defaultText));
    for (const [id, name] of Object.entries(options)) {
        fragment.appendChild(createElement('option', { value: id }, name));
    }
    document.querySelector(selector).appendChild(fragment);
};

//Manages dropdown population for both authors and genres, reducing duplication.

//__________________________________Function to apply theme_______________________________________
const applyTheme = (theme) => {
    const isNight = theme === 'night';
    document.documentElement.style.setProperty('--color-dark', isNight ? '255, 255, 255' : '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', isNight ? '10, 10, 20' : '255, 255, 255');
    document.querySelector('[data-settings-theme]').value = theme;
};

//Controls the light/dark theme switch logic.

//______________________________Function to add toggle listeners___________________________________
const addToggleListener = (trigger, target, open) => {
    document.querySelector(trigger).addEventListener('click', () => {
        document.querySelector(target).open = open;
    });
};

//Simplifies the logic of opening and closing overlays by abstracting the repetitive event listeners.

//______________________________________Initial render_____________________________________________
renderBooks(matches.slice(0, BOOKS_PER_PAGE));

populateDropdown('[data-search-genres]', genres, 'All Genres');
populateDropdown('[data-search-authors]', authors, 'All Authors');

applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day');

addToggleListener('[data-search-cancel]', '[data-search-overlay]', false);
addToggleListener('[data-settings-cancel]', '[data-settings-overlay]', false);
addToggleListener('[data-header-search]', '[data-search-overlay]', true);
addToggleListener('[data-header-settings]', '[data-settings-overlay]', true);
addToggleListener('[data-list-close]', '[data-list-active]', false);

//____________________________________Handle theme changes__________________________________________
const settingsForm = document.querySelector('[data-settings-form]');
settingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const { theme } = Object.fromEntries(new FormData(event.target));
    applyTheme(theme);
    document.querySelector('[data-settings-overlay]').open = false;
});

//_____________________________________Handle search form____________________________________________
const searchForm = document.querySelector('[data-search-form]');
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const { title, author, genre } = Object.fromEntries(new FormData(event.target));

    matches = books.filter((book) => {
        const genreMatch = genre === 'any' || book.genres.includes(genre);
        const authorMatch = author === 'any' || book.author === author;
        const titleMatch = title.trim() === '' || book.title.toLowerCase().includes(title.toLowerCase());
        return genreMatch && authorMatch && titleMatch;
    });

    page = 1;
    document.querySelector('[data-list-items]').innerHTML = '';
    renderBooks(matches.slice(0, BOOKS_PER_PAGE));

    document.querySelector('[data-list-message]').classList.toggle('list__message_show', matches.length === 0);
    document.querySelector('[data-search-overlay]').open = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

//____________________________________Handle "Show more" button_______________________________________
const showMoreButton = document.querySelector('[data-list-button]');
showMoreButton.addEventListener('click', () => {
    renderBooks(matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE));
    page++;
    showMoreButton.disabled = matches.length <= page * BOOKS_PER_PAGE;
});

//____________________________________Handle book preview click________________________________________
const bookList = document.querySelector('[data-list-items]');
bookList.addEventListener('click', (event) => {
    const previewId = event.target.closest('[data-preview]')?.dataset.preview;
    if (!previewId) return;

    const activeBook = books.find((book) => book.id === previewId);
    if (activeBook) {
        const { image, title, author, published, description } = activeBook;
        document.querySelector('[data-list-active]').open = true;
        document.querySelector('[data-list-blur]').src = image;
        document.querySelector('[data-list-image]').src = image;
        document.querySelector('[data-list-title]').innerText = title;
        document.querySelector('[data-list-subtitle]').innerText = `${authors[author]} (${new Date(published).getFullYear()})`;
        document.querySelector('[data-list-description]').innerText = description;
    }
});
