const BASE_URL = "https://lighthouse-user-api.herokuapp.com/"
const INDEX_URL = BASE_URL + "api/v1/users/"
const USERS_PER_PAGE = 24

//條件列表
const users = []
let filteredUsers = users
let filteredUsersGender = []
let filterUsersName = []
let displayGender = 'both'
let keyword = ''


const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const searchRadio = document.querySelector('#search-radio')

//渲染畫面
function renderUserList(data) {
  let rawHTML = ''
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  let listedId = []
  list.forEach(user => listedId.push(user.id))

  //processing
  data.forEach((item) => {
    if (listedId.includes(item.id)) {
      //name surname email gender age region birthday avatat
      rawHTML += `<div class="col-6 col-sm-4 col-md-3 col-lg-2">
      <div class="mb-2">
        <div class="card d-flex justify-content-center">
          <img src="${item.avatar}" class="card-img-top" alt="Friend avatar">
          <div class="card-body">
            <h6 class="card-title d-flex justify-content-center">${item.name} </h6>
          </div>
          <div class="card-footer d-flex justify-content-between text-muted">
            <button class="btn btn-info btn-show-info" data-toggle="modal" data-target="#info-modal" data-id="${item.id}">More !</button>
            <button type="button" class="btn btn-danger btn-circle btn-add-favorite in-favorite" data-id="${item.id}"><i class="fa fa-heart"></i></button>
          </div>
        </div>
      </div>
    </div>`
    } else {
      rawHTML += `<div class="col-6 col-sm-4 col-md-3 col-lg-2">
      <div class="mb-2">
        <div class="card d-flex justify-content-center">
          <img src="${item.avatar}" class="card-img-top" alt="Friend avatar">
          <div class="card-body">
            <h6 class="card-title d-flex justify-content-center">${item.name} </h6>
          </div>
          <div class="card-footer d-flex justify-content-between text-muted">
            <button class="btn btn-info btn-show-info" data-toggle="modal" data-target="#info-modal" data-id="${item.id}">More !</button>
            <button type="button" class="btn btn-danger btn-circle btn-add-favorite" data-id="${item.id}"><i class="fa fa-heart"></i></button>
          </div>
        </div>
      </div>
    </div>`
    }

  })
  dataPanel.innerHTML = rawHTML
}

//渲染分頁器
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  //製作 template 
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

//顯示資訊卡
function showInfoModal(id) {
  const modalName = document.querySelector('#info-modal-title')
  const modalEmail = document.querySelector('#info-modal-email')
  const modalRegion = document.querySelector('#info-modal-region')
  const modalBirthday = document.querySelector('#info-modal-birthday')
  const modalAvatar = document.querySelector('#info-avatar')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data
    if (data.gender === 'male') {
      modalName.innerHTML = `${data.name} ${data.surname} <i class="fa fa-mars" aria-hidden="true" style="color: #506BE2;"></i> ${data.age}`
    } else {
      modalName.innerHTML = `${data.name} ${data.surname} <i class="fa fa-venus" aria-hidden="true" style="color: #EB8C8C;"></i> ${data.age}`
    }

    modalEmail.innerHTML = `<i class="fa fa-envelope-open" aria-hidden="true"></i> ${data.email}`
    modalRegion.innerHTML = `<i class="fa fa-address-card" aria-hidden="true"></i> ${data.region}`
    modalBirthday.innerHTML = `<i class="fa fa-birthday-cake fa-lg" aria-hidden="true"></i> ${data.birthday}`
    modalAvatar.innerHTML = `<img src="${data.avatar}" alt="info-avatar">`

  })

}

//新增或移除最愛
function controlFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = users.find((user) => user.id === id)
  if (list.some((user) => user.id === id)) {
    const listIndex = list.findIndex((user) => user.id === id)
    list.splice(listIndex, 1)
    localStorage.setItem('favoriteUsers', JSON.stringify(list))
  } else {
    list.push(user)
    localStorage.setItem('favoriteUsers', JSON.stringify(list))
  }
}

//分頁回傳使用者
function getUsersByPage(page) {
  //計算起始 index 
  const startIndex = (page - 1) * USERS_PER_PAGE
  //回傳切割後的新陣列
  return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE)
}

//透過條件篩選使用者
function getUsersByCondition(name, gender) {
  filteredUsersGender = users.filter((user) => user.gender === displayGender)
  if (!filteredUsersGender.length) {
    filteredUsersGender = users
  }
  filteredUsersName = filteredUsersGender.filter((user) =>
    user.name.toLowerCase().includes(name))

  filteredUsers = filteredUsersName

  renderUserList(getUsersByPage(1))
  renderPaginator(filteredUsers.length)

}

//抓取API
axios.get(INDEX_URL).then((response) => {
  users.push(...response.data.results)
  renderPaginator(filteredUsers.length)
  renderUserList(getUsersByPage(1))
})

//分頁器控制
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderUserList(getUsersByPage(page))
})

//資料卡按鈕操作
dataPanel.addEventListener('click', function onPanelClicked(event) {
  //若用匿名函數會比較難deBug
  if (event.target.matches('.btn-show-info')) {
    showInfoModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    event.target.classList.toggle('in-favorite')
    controlFavorite(Number(event.target.dataset.id))
  } else if (event.target.matches('.fa-heart')) {
    event.target.parentElement.classList.toggle('in-favorite')
    controlFavorite(Number(event.target.parentElement.dataset.id))
  }
})

//避免無效搜尋
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  keyword = searchInput.value.trim().toLowerCase()
  if (!keyword.length) {
    return alert('請輸入有效字串！')
  }
})

//及時搜尋
searchForm.addEventListener('keyup', function onSearchFormInput(event) {
  event.preventDefault()
  keyword = searchInput.value.trim().toLowerCase()
  getUsersByCondition(keyword, displayGender)
})

//性別選擇
searchRadio.addEventListener('click', function onSearchFormChecked(event) {
  displayGender = event.target.value
  getUsersByCondition(keyword, displayGender)
})




