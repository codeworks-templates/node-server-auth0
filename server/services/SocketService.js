import { Server } from 'socket.io'
import { Auth0Provider } from '@bcwdev/auth0provider'
import { logger } from '../utils/Logger'
import { attachHandlers } from '../../Setup'
import { accountService } from './AccountService'

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

class SocketService {
  io = new Server();
  /**
   * @param {Server} io
   */
  setIO(io) {
    try {
      this.io = io
      io.on(SOCKET_EVENTS.connection, this.onConnect())
    } catch (e) {
      logger.error('[SOCKETSTORE ERROR]', e)
    }
  }

  /**
   * @param {import('socket.io').Socket} socket
   */
  async authenticate(socket, bearerToken) {
    try {
      const user = await Auth0Provider.getUserInfoFromBearerToken(bearerToken)
      const profile = await accountService.getAccount(user)
      const limitedProfile = {
        id: profile.id,
        // @ts-ignore
        email: profile.email,
        // @ts-ignore
        picture: profile.picture
      }
      socket.join(user.id)
      attachHandlers(this.io, socket, user, limitedProfile)
      socket.emit(SOCKET_EVENTS.authenticated, limitedProfile)
      this.io.emit(SOCKET_EVENTS.userConnected, user.id)
    } catch (e) {
      socket.emit(SOCKET_EVENTS.error, e)
    }
  }

  /**
   * Sends a direct message to a user
   * @param {string} userId
   * @param {string} eventName
   * @param {any} payload
   */
  messageUser(userId, eventName, payload) {
    try {
      this.io.to(userId).emit(eventName, payload)
    } catch (e) {
      logger.error('[SOCKET_ERROR] messageUser', e, { userId, eventName, payload })
    }
  }

  messageRoom(room, eventName, payload) {
    this.io.to(room).emit(eventName, payload)
  }

  onConnect() {
    return socket => {
      attachHandlers(this.io, socket)
      this.newConnection(socket)
      socket.on(SOCKET_EVENTS.disconnect, this.onDisconnect(socket))
      socket.on(SOCKET_EVENTS.authenticate, (bearerToken) => this.authenticate(socket, bearerToken))
    }
  }

  onDisconnect(socket) {
    return () => {
      try {
        if (!socket.userInfo) {
          return
        }
        this.io.emit(SOCKET_EVENTS.userDisconnected, socket.userInfo.id)
      } catch (e) {}
    }
  }

  newConnection(socket) {
    // Handshake / Confirmation of Connection
    socket.emit(SOCKET_EVENTS.connected, {
      socket: socket.id,
      message: 'Successfully Connected'
    })
  }
}

export const socketService = new SocketService()
