import { ProxyState } from '../AppState.js'
import { logger } from '../Utils/Logger.js'
import { server } from './AxiosService.js'

class AccountService {
  async getAccount() {
    try {
      const res = await server.get('/account')
      ProxyState.account = res.data
    } catch (err) {
      logger.error(err)
    }
  }
}

export const accountService = new AccountService()
