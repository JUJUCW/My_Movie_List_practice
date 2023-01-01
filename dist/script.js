// v1=version 1 調整版本可以直接改
// const BASE_URL = 'https://movie-list.alphacamp.io' // 維持乾淨可重複利用
// const INDEX_URL = BASE_URL + '/api/v1/movies/1'; // 串接 Show API 時能更改
// const POSTER_URL = BASE_URL + '/posters/'  // 用以處理圖片檔案

// const movies = []
// // console.log(axios.get(INDEX_URL))
// axios.get(INDEX_URL)
//   .then((response) => {
//     movies.push(...response.data.results)
//     console.log(movies)
//   }

// ).catch((err)=>console.log(err))

const BASE_URL = 'https://webdev.alphacamp.io';
const INDEX_URL = BASE_URL + '/api/movies/';
const POSTER_URL = BASE_URL + '/posters/';

// const corsURL = 'https://cors-anywhere.herokuapp.com/'; // use cors-anywhere to fetch api data
// // api call
const movies = []; // 存放電影資料項目，使用 const 代表 movies 裡面的資料不可變動，因此無法使用賦值的方式將資料放進變數
let filteredMovies = []; // 存放搜尋結果
const MOVIES_PER_PAGES = 12;

const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const paginator = document.querySelector('#paginator');

function renderMovieList(data) {
    // 儘量不要耦合 params，使用 data 不用 movies
    let rawHTML = '';
    data.forEach((item) => {
        // title image
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
                                <button class="btn btn-outline-dark btn-add-favorite" data-id="${item.id}">+</button>
                            </div>
                        </div>
                    </div>
                </div>`;
    });
    dataPanel.innerHTML = rawHTML;
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
    e.preventDefault(); // 按下 search 提交搜尋表單時，網頁不會刷新，將 UI 控制權放在 JS
    // console.log("click!") // for test
    // console.log(searchInput.value) // console 出 searchInput 內的值
    const keyword = searchInput.value.trim().toLowerCase(); // 搜尋不分大小寫，.trim()可以去頭去尾的空格搜尋

    // if (!keyword.length) { // 當數值為 0，boolean value 為 false，! 則負負得正後，執行 return
    //     return alert('Please enter a valid string.');
    // }

    filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword)); // 留下 keyword 結果，其他丟掉
    // for (const movie of movies) {
    //     if (movie.title.toLowerCase().includes(keyword)) { // 跟 const keyword 必須都要 .toLowerCase() (or toUpperCase())
    //         filteredMovie.push(movie);
    //     }
    // }

    if (filteredMovies.length === 0) {
        return alert('Cannot find movies with keyword:' + keyword);
    }
    renderPaginator(filteredMovies.length);
    renderMovieList(getMoviesByPage(1));
});
function showMovieModal(id) {
    const modalTitle = document.querySelector('#movie-modal-title');
    const modalImage = document.querySelector('#movie-modal-image');
    const modalDate = document.querySelector('#movie-modal-date');
    const modalDescription = document.querySelector('#movie-modal-description');

    axios.get(INDEX_URL + id).then((response) => {
        const data = response.data.results;
        // innerText 取得渲染後的文字內容
        // textContent 取出純文字，忽視 html 後的的文字內容
        // innerHTML 選取的文字包含 html 的 tag
        modalTitle.innerText = data.title;
        modalDate.innerText = 'Release date: ' + data.release_date;
        modalDescription.innerText = data.description;
        modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`;
    });
}

function addToFavorite(id) {
    console.log(id); // 確認有抓到對的 id
    function isMovieIdMatched(movie) {
        return movie.id === id;
    }
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []; // 如果沒有 .getItem()就回傳 []
    const movie = movies.find(isMovieIdMatched); // arr.find(callback[, thisArg])  會回傳第一個滿足所提供之「測試函式」的元素值

    // console.log(movie)
    if (list.some(isMovieIdMatched)) {
        // 重複選取則顯示 alert
        return alert('The movie is already in the collection list!');
    }
    list.push(movie);
    localStorage.setItem('favoriteMovies', JSON.stringify(list));
    console.log(list);
}

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
    // console.log(page)
    renderMovieList(getMoviesByPage(page));
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
        renderMovieList(getMoviesByPage(1));
    })

    .catch((error) => {
        console.warn(error);
    });

// localStorage.setItem("default-language", "english") // string only

// localStorage.removeItem('default-language')
