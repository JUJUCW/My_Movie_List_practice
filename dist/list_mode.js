const BASE_URL = 'https://webdev.alphacamp.io';
const INDEX_URL = BASE_URL + '/api/movies/';
const POSTER_URL = BASE_URL + '/posters/';

// // api call
const movies = []; // 存放電影資料項目，使用 const 代表 movies 裡面的資料不可變動，因此無法使用賦值的方式將資料放進變數
let filteredMovies = []; // 存放搜尋結果
const MOVIES_PER_PAGES = 12;

// 宣告 currentPage 記錄目前分頁，避免切換模式分頁跑掉
let currentPage = 1
const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const paginator = document.querySelector('#paginator');
const modeSwitch = document.querySelector('#change-mode');

function renderMovieList(data) {
    // 儘量不要耦合 params，使用 data 不用 movies
    if (dataPanel.dataset.mode === 'card-mode') {
        let rawHTML = '';
        data.forEach((item) => {
            // title image
            rawHTML += `
                  <div class="col-sm-3">
                    <div class="mb-2">
                        <div class="card">
                            <img src="${POSTER_URL + item.image}"
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
                                <button class="btn btn-outline-dark btn-add-favorite" data-id="${item.id}">+</button>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
        dataPanel.innerHTML = rawHTML;
    } else if (dataPanel.dataset.mode === 'list-mode') {
        let rawHTML = `<ul class="list-group col-sm-12 mb-2">`;
        data.forEach((item) => {
            rawHTML += `
            <li class="list-group-item justify-content-between f-flex">
                <h5 class="card-title">${item.title}</h5>
                <div>
                    <button class="btn btn-outline-info ntn-shoe-movie"
                            data-bs-toggle="modal"
                            data-bs-target="#movie-modal"
                            data-id="${item.id}">more</button>
                    <button class="btn btn-outline-info btn-add-favorite" data-id="${item.id}">+</button>
                </div>
            </li>`;
        });
        rawHTML += `</ul>`;
        dataPanel.innerHTML=rawHTML
    }
}

function renderPaginator(amount) {
    // 電影總數量
    const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGES); // 一個大於等於指定數字的最小整數。
    let rawHTML = '';
    for (let page = 1; page <= numberOfPage; page++) {
        rawHTML += `
                <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
        // 實際是綁在 <a> 上面，像按鈕操作
    }
    paginator.innerHTML = rawHTML;
}

// page 1 -> 0-11
// page 2 -> 12-23
// page 3 -> 24-36
function getMoviesByPage(page) {
    //  movies ? "movies":"filteredMovies"
    const data = filteredMovies.length ? filteredMovies : movies;
    const startIndex = (page - 1) * MOVIES_PER_PAGES;
    return data.slice(startIndex, startIndex + MOVIES_PER_PAGES);
}

searchForm.addEventListener('submit', function onSearchFormSubmitted(e) {
    e.preventDefault(); 
    const keyword = searchInput.value.trim().toLowerCase(); 

    filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword)); 

    if (filteredMovies.length === 0) {
        return alert('Cannot find movies with: ' + keyword);
    }currentPage=1
    renderPaginator(filteredMovies.length);
    renderMovieList(getMoviesByPage(currentPage));
});

function showMovieModal(id) {
    // get elements
    const modalTitle = document.querySelector('#movie-modal-title');
    const modalImage = document.querySelector('#movie-modal-image');
    const modalDate = document.querySelector('#movie-modal-date');
    const modalDescription = document.querySelector('#movie-modal-description');

    // send request to show api
    axios.get(INDEX_URL + id).then((response) => {
        const data = response.data.results;

        // insert data into modal ui
        modalTitle.innerText = data.title;
        modalDate.innerText = 'Release date: ' + data.release_date;
        modalDescription.innerText = data.description;
        modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`;
    });
}

function addToFavorite(id) {

    function isMovieIdMatched(movie) {
        return movie.id === id;
    }
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []; 
    const movie = movies.find(isMovieIdMatched); 
    if (list.some(isMovieIdMatched)) {
        // 重複選取則顯示 alert
        return alert('The movie is already in the collection list!');
    }
    list.push(movie);
    localStorage.setItem('favoriteMovies', JSON.stringify(list));
    console.log(list);
}

// 依照 data 切換顯示方式
function changeDisplayMode(displayMode) {
    if (dataPanel.dataset.mode === displayMode) return
    dataPanel.dataset.mode = displayMode
}

// 監聽事件
modeSwitch.addEventListener('click',function onSwitchClick(e) {
    if (e.target.matches('#card-mode-button')) {
        changeDisplayMode('card-mode')
        renderMovieList(getMoviesByPage(currentPage))
    } else if (e.target.matches('#list-mode-button')) {
        changeDisplayMode('list-mode')
        renderMovieList(getMoviesByPage(currentPage))
    }
})

dataPanel.addEventListener('click', function onPanelClicked(e) {
    // 具名函式會比匿名函式容易 debug
    if (e.target.matches('.btn-show-movie')) {
        // 只有在點擊 <button class='btn-show-movie'> 時才會是 true
        showMovieModal(Number(e.target.dataset.id));
        // console.log(e.target.dataset);
    } else if (e.target.matches('.btn-add-favorite')) {
        addToFavorite(Number(e.target.dataset.id));
    }
});

paginator.addEventListener('click', function onPaginatorClicked(e) {
    if (e.target.tagName !== 'A') return;
    const page = Number(e.target.dataset.page);
currentPage=page
    renderMovieList(getMoviesByPage(currentPage));
});

axios
    // .get(`${corsURL}${INDEX_URL}`, {})
    .get(INDEX_URL)
    .then((response) => {
        // for (const movie of response.data.results) {
        // movies.push(movie)
        // }

        movies.push(...response.data.results);
        // 展開運算子 (spread operator) 讓每個元素都變成 push 中的一個參數
        // 使用 push() 修改 array 是 copied by reference，屬於「深層修改」不會觸發 const 限制

        renderPaginator(movies.length);
        renderMovieList(getMoviesByPage(currentPage));
    })

    .catch((error) => {
        console.warn(error);
    });

// localStorage.setItem("default-language", "english") // string only

// localStorage.removeItem('default-language')
