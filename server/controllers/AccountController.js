import { Auth0Provider } from '@bcwdev/auth0provider'
import { accountService } from '../services/AccountService'
import BaseController from '../utils/BaseController'

export class AccountController extends BaseController {
  constructor() {
    super('account')
    this.router
      .use(Auth0Provider.getAuthorizedUserInfo)
      .get('', this.getUserAccount)
  }

  async getUserAccount(req, res, next) {
    try {
      const profile = await accountService.getAccount(req.userInfo)
      res.send(profile)
    } catch (error) {
      next(error)
    }
  }
}
