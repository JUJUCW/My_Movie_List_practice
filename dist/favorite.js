const BASE_URL = 'https://webdev.alphacamp.io';
const INDEX_URL = BASE_URL + '/api/movies/';
const POSTER_URL = BASE_URL + '/posters/';

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];

const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');

function renderMovieList(data) {
    let rawHTML = '';
    data.forEach((item) => {
        rawHTML += `
                  <div class="col-sm-3">
                    <div class="mb-2">
                        <div class="card">
                            <img
                                src="${POSTER_URL + item.image}"
                                class="card-img-top"
                                alt="Movie Poster"
                            />
                            <div class="card-body">
                                <h5 class="card-title">${item.title}</h5>
                            </div>
                            <div class="card-footer">
                                <button
                                    class="btn btn-outline-info btn-show-movie"
                                    data-bs-toggle="modal"
                                    data-bs-target="#movie-modal"
                                    data-id="${item.id}"
                                >
                                    More 
                                </button>
                                <button class="btn btn-danger btn-add-favorite" data-id="${item.id}">x</button>
                            </div>
                        </div>
                    </div>
                </div>`;
    });
    dataPanel.innerHTML = rawHTML;
}

function showMovieModal(id) {
    const modalTitle = document.querySelector('#movie-modal-title');
    const modalImage = document.querySelector('#movie-modal-image');
    const modalDate = document.querySelector('#movie-modal-date');
    const modalDescription = document.querySelector('#movie-modal-description');

    axios.get(INDEX_URL + id).then((response) => {
        const data = response.data.results;
        modalTitle.innerText = data.title;
        modalDate.innerText = 'Release date: ' + data.release_date;
        modalDescription.innerText = data.description;
        modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`;
    });
}

function removeFromFavorite(id) {
    function isMovieIdMatched(movie) {
        return movie.id === id;
    }

    const movieIndex = movies.findIndex(isMovieIdMatched);
    // return console.log(movieIndex); // findIndex() 方法將依據提供的測試函式，尋找陣列中符合的元素，並返回其 index（索引）。如果沒有符合的對象，將返回 -1 。
    movies.splice(movieIndex, 1);

    localStorage.setItem('favoriteMovies', JSON.stringify(movies)); // 由 list 改為 movies

    renderMovieList(movies);
}

dataPanel.addEventListener('click', function onPanelClicked(e) {
    if (e.target.matches('.btn-show-movie')) {
        showMovieModal(Number(e.target.dataset.id));
    } else if (e.target.matches('.btn-add-favorite')) {
        removeFromFavorite(Number(e.target.dataset.id));
    }
});

renderMovieList(movies);
