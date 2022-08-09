import { baseURL } from '../env.js'
import { logger } from './Logger.js'

let connected = false
let queue = []

const SOCKET_EVENTS = {
  connection: 'connection',
  connected: 'connected',
  disconnect: 'disconnect',
  authenticate: 'authenticate',
  authenticated: 'authenticated',
  userConnected: 'userConnected',
  userDisconnected: 'userDisconnected',
  error: 'error'
}

export class SocketHandler {
  /**
   * @param {String} url
   */
  constructor(url = baseURL) {
    // @ts-ignore
    // eslint-disable-next-line no-undef
    this.socket = io(url || baseURL)
    this
      .on(SOCKET_EVENTS.connected, this.onConnected)
      .on(SOCKET_EVENTS.authenticated, this.onAuthenticated)
      .on(SOCKET_EVENTS.error, this.onError)
  }

  on(event, fn) {
    this.socket.on(event, fn.bind(this))
    return this
  }

  onConnected(connection) {
    logger.log('[SOCKET_CONNECTION]', connection)
    connected = true
  }

  onAuthenticated(auth) {
    logger.log('[SOCKET_AUTHENTICATED]', auth)
    const playback = [...queue]
    queue = []
    playback.forEach(e => {
      this.emit(e.action, e.payload)
    })
  }

  authenticate(bearerToken) {
    this.socket.emit(SOCKET_EVENTS.authenticate, bearerToken)
  }

  onError(error) {
    logger.error('[SOCKET_ERROR]', error)
  }

  /**
   * Send a Message to the Server with an optional payload
   * @param {string} action
   * @param {any} [payload]
   */
  emit(action, payload) {
    if (!connected) {
      logger.log('[ENQUEING_ACTION]', { action, payload })
      return queue.push({ action, payload })
    }
    this.socket.emit(action, payload)
  }
}
