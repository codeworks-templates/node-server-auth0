import { ProxyState } from '../AppState.js'
import { audience, clientId, domain } from '../env.js'
import { api } from './AxiosService.js'
import { accountService } from './AccountService.js'
import { socketService } from './SocketService.js'

export const AuthService = Auth0Provider.initialize({
  domain,
  clientId,
  audience,
  onRedirectCallback: appState => {
    window.location.replace(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname
    )
  }
})

AuthService.on(AuthService.AUTH_EVENTS.AUTHENTICATED, async() => {
  api.defaults.headers.authorization = AuthService.bearer
  ProxyState.user = AuthService.user
  socketService.authenticate(AuthService.bearer)
  await accountService.getAccount()
})
