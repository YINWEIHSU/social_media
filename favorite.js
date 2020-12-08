const BASE_URL = "https://lighthouse-user-api.herokuapp.com/"
const INDEX_URL = BASE_URL + "api/v1/users/"
const USERS_PER_PAGE = 24

const users = JSON.parse(localStorage.getItem('favoriteUsers'))
const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')

function renderUserList(data) {
  let rawHTML = ''

  //processing
  data.forEach((item) => {
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
            <button type="button" class="btn btn-danger btn-circle btn-remove-favorite" data-id="${item.id}"><i class="fa fa-times"></i></button>
          </div>
        </div>
      </div>
    </div>`
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

function removeFromFavorite(id) {
  if (!users) return

  //透過 id 找到要刪除用戶的 index
  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return

  //刪除該筆用戶
  users.splice(userIndex, 1)

  //存回 local storage
  localStorage.setItem('favoriteUsers', JSON.stringify(users))

  //更新頁面
  renderUserList(users)
}

//分頁回傳使用者
function getUsersByPage(page) {
  //計算起始 index 
  const startIndex = (page - 1) * USERS_PER_PAGE
  //回傳切割後的新陣列
  return users.slice(startIndex, startIndex + USERS_PER_PAGE)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  //若用匿名函數會比較難deBug
  console.log(event.target.children)
  console.log(event.target)
  console.log(event.target.parentElement)
  if (event.target.matches('.btn-show-info')) {
    showInfoModal(Number(event.target.dataset.id))
    removeFromFavorite(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  } else if (event.target.matches('.fa-times')) {
    removeFromFavorite(Number(event.target.parentElement.dataset.id))
  }
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

renderUserList(getUsersByPage(1))
renderPaginator(users.length)

