let singleRightMenu = null
export class RightMenu {
  constructor(e, menus, callBack, params = {}) {
    if (singleRightMenu) {
      singleRightMenu.destroy()
    }
    this.menusWarp = document.createElement('div')
    this.menusWarp.className = 'right-menu-warp'
    const menusList = document.createElement('ul')
    menusList.className = 'right-menu-list'
    menus.forEach((item) => {
      const menuItem = document.createElement('li')
      menuItem.className = 'right-menu-item'
      menuItem.innerText = item.title
      menusList.appendChild(menuItem)
      menuItem.addEventListener('click', () => {
        callBack(item, params)
      })
    })
    this.menusWarp.appendChild(menusList)
    document.body.appendChild(this.menusWarp)
    const w = window.innerWidth
    const h = window.innerHeight
    const sizeW = this.menusWarp.offsetWidth
    const sizeH = this.menusWarp.offsetHeight
    const maxLeft = w - sizeW
    const maxTop = h - sizeH
    const setLeft = Math.min(e.clientX, maxLeft)
    const setTop = Math.min(e.clientY, maxTop)
    this.menusWarp.style.left = setLeft + 'px'
    this.menusWarp.style.top = setTop + 'px'
    const that = this
    function destroyRightMenu() {
      that.destroy()
      document.removeEventListener('click', destroyRightMenu)
    }
    document.addEventListener('click', destroyRightMenu)
    singleRightMenu = this
  }
  destroy() {
    if (this.menusWarp) {
      document.body.removeChild(this.menusWarp)
      this.menusWarp = null
    }
    singleRightMenu = null
  }
}
