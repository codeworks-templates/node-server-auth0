export class Auth0Provider {
  static auth0Client = {};
  static authListeners = [];
  static unauthListeners = [];
  static isAuthenticated = false;
  static user = {};
  static userInfo = {};
  static identity = {};
  static bearer = "";
  static domain = "";

  static async init({ domain, clientId, audience }) {
    this.domain = domain;
    // @ts-ignore
    this.auth0Client = await createAuth0Client({
      domain,
      client_id: clientId,
      audience
    });
    this.isAuthenticated = await this.auth0Client.isAuthenticated();

    if (this.isAuthenticated) {
      await this.AUTHENTICATED();
      return;
    }
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
      // Process the login state
      await this.auth0Client.handleRedirectCallback();
      await this.AUTHENTICATED();

      // Use replaceState to redirect the user away and remove the querystring parameters
      window.history.replaceState({}, document.title, "/");
    }
  }

  static async login() {
    try {
      await this.auth0Client.loginWithPopup();
      await this.AUTHENTICATED();
    } catch (e) {
      console.error(e);
    }
  }

  /** Logs the user out and removes their session on the authorization server */
  static async logout() {
    await this.auth0Client.logout({
      returnTo: window.location.origin
    });
    this.bearer = "";
    this.user = {};
    this.userInfo = {};
    this.identity = {};
    this.isAuthenticated = false;
    this.UNAUTHENTICATED();
  }

  /**
   * Register function to be called when authenticated
   * @param {function} cb
   */
  static onAuth(cb) {
    this.authListeners.push(cb);
  }
  /**
   * Register function to be called when unauthenticated
   * @param {function} cb
   */
  static onUnAuth(cb) {
    this.unauthListeners.push(cb);
  }

  static getIdTokenClaims(o) {
    return this.auth0Client.getIdTokenClaims(o);
  }
  /** Returns the access token. If the token is invalid or missing, a new one is retrieved */
  static getTokenSilently(o) {
    return this.auth0Client.getTokenSilently(o);
  }
  static hasPermissions(permissions) {
    if (!Array.isArray(permissions)) {
      permissions = [permissions];
    }
    if (!this.identity.permissions) {
      return false;
    }
    while (permissions.length) {
      let next = permissions.pop();
      let found = this.identity.permissions.find(p => p == next);
      if (!found) {
        return false;
      }
    }
    return true;
  }
  static hasRoles(roles) {
    if (!Array.isArray(roles)) {
      roles = [roles];
    }
    if (!this.userInfo.roles) {
      return false;
    }
    while (roles.length) {
      let next = roles.pop();
      let found = this.userInfo.roles.find(r => r == next);
      if (!found) {
        return false;
      }
    }
    return true;
  }

  /** Gets the access token using a popup window */
  static getTokenWithPopup(o) {
    return this.auth0Client.getTokenWithPopup(o);
  }
  static async getUserData() {
    try {
      this.auth0Client;
      let token = await this.getTokenSilently();
      let identity = await this.__getIdentityClaims(token);
      this.bearer = "Bearer " + token;
      let res = await fetch(`https://${this.domain}/userinfo`, {
        headers: {
          authorization: this.bearer
        }
      });

      let userData = await res.json();
      for (var key in userData) {
        let keep = key;
        if (key.includes("https")) {
          keep = keep.slice(keep.lastIndexOf("/") + 1);
        }
        this.userInfo[keep] = userData[key];
      }
    } catch (e) {
      console.error(e);
    }
  }

  static async AUTHENTICATED() {
    try {
      this.user = await this.auth0Client.getUser();
      await this.getUserData();
      this.authListeners.forEach(cb => {
        cb(this);
      });
    } catch (e) {
      console.error(e);
    }
  }
  static async UNAUTHENTICATED() {
    try {
      this.unauthListeners.forEach(cb => {
        cb(this);
      });
    } catch (e) {
      console.error(e);
    }
  }

  static __b64DecodeUnicode(str) {
    return decodeURIComponent(
      atob(str).replace(/(.)/g, function(m, p) {
        var code = p
          .charCodeAt(0)
          .toString(16)
          .toUpperCase();
        if (code.length < 2) {
          code = "0" + code;
        }
        return "%" + code;
      })
    );
  }
  static __decodeToken(str = "") {
    str = str.split(".")[1];
    var output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += "==";
        break;
      case 3:
        output += "=";
        break;
      default:
        throw "Illegal base64url string!";
    }

    try {
      return this.__b64DecodeUnicode(output);
    } catch (err) {
      return atob(output);
    }
  }
  static async __getIdentityClaims(token) {
    this.identity = JSON.parse(this.__decodeToken(token));
    return this.identity;
  }
}
