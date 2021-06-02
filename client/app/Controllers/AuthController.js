import { ProxyState } from '../AppState.js'
import { AuthService } from '../Services/AuthService.js'
import { logger } from '../Utils/Logger.js'

function drawUser() {
  const user = ProxyState.user
  const userAvatar = avatarTemplate(user)
  const button = authButton(user)

  const template = /* html */ `
    ${userAvatar}
    ${button}
  `
  document.getElementById('authstate').innerHTML = template
}

export class AuthController {
  constructor() {
    ProxyState.on('user', drawUser)
    AuthService.on(AuthService.AUTH_EVENTS.LOADED, drawUser)
    drawUser()
  }

  async login() {
    try {
      await AuthService.loginWithPopup()
    } catch (e) {
      logger.error(e)
    }
  }

  logout() {
    try {
      AuthService.logout()
    } catch (e) {
      logger.error(e)
    }
  }
}

function authButton(user) {
  if (AuthService.loading) { return '' }
  return user.isAuthenticated
    ? /* html */ `
    <button class="btn btn-small btn-dark text-muted" onclick="app.authController.logout()">✖</button>
  `
    : /* html */ `
    <button class="btn btn-dark" onclick="app.authController.login()">login</button>
  `
}

function avatarTemplate(user) {
  return user.isAuthenticated
    ? /* html */ `
    <div class="mr-2">
      <img class="rounded-circle" src="${user.picture}" alt="${user.name}" height="45"/>
      <span class="mx-1">${user.name}</span>
      </div>`
    : AuthService.loading
      ? /* html */ `
      <div class="skeleton-loader dark avatar"></div>
      <div class="skeleton-loader dark text sm mx-2"></div>`
      : /* html */`
      <div></div>
      `
}
