import { domain, clientId, audience } from "./AuthConfig.js";
import { Auth0Provider } from "./Auth0Provider.js";

async function initializeAuth() {
  try {
    await Auth0Provider.init({ domain, clientId, audience });
  } catch (e) {
    console.error(e);
  }
}

function drawUser() {
  let user = Auth0Provider.user;
  let userAvatar = avatarTemplate(user);
  let button = authButton(user);

  let template = /*html*/ `
    <div class="d-flex align-items-center justify-content-between p-2">
      ${userAvatar}
      ${button}
    </div>
  `;
  document.getElementById("authbar").innerHTML = template;
}

export class AuthController {
  constructor() {
    Auth0Provider.onAuth(drawUser);
    Auth0Provider.onUnAuth(drawUser);
    initializeAuth();
    drawUser();
  }

  async login() {
    try {
      await Auth0Provider.login();
    } catch (e) {
      console.error(e);
    }
  }

  async logout() {
    try {
      await Auth0Provider.logout();
    } catch (e) {
      console.error(e);
    }
  }
}

function authButton(user) {
  return user.sub
    ? /*html*/ `
    <button class="btn btn-danger" onclick="app.authController.logout()">logout</button>
  `
    : /*html*/ `
    <button class="btn btn-info" onclick="app.authController.login()">login</button>
  `;
}

function avatarTemplate(user) {
  return user.sub
    ? /*html*/ `
    <div>
      <img class="rounded-circle" src="${user.picture}" alt="${user.name}" height="45"/>
      <span class="ml-2">${user.name}</span>
    </div>`
    : /*html*/ `
    <div></div>
    `;
}
