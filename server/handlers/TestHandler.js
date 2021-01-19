import { SocketHandler } from './SocketHandler'

export class TestHandler extends SocketHandler {
  constructor() {
    super(...arguments)
    this.socket
      .on('TEST_EVENT', this.testEvent)
  }

  async testEvent(payload) {
    this.socket.emit('THANKS', {
      user: this.user,
      profile: this.profile,
      payload
    })
  }
}
