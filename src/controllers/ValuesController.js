import { Auth0Provider } from '@bcwdev/auth0provider'
import { valuesService } from '../services/ValuesService.js'
import BaseController from '../utils/BaseController'

export class ValuesController extends BaseController {
  constructor() {
    super('api/values')
    this.router
      .get('', this.getAll)
      // NOTE If there is an authenticated user it will attach here otherwise allows through
      .get('/:id', Auth0Provider.tryAttachUserInfo, this.getOneValue)
      // NOTE: Beyond this point all routes require Authorization Bearer token
      .use(Auth0Provider.getAuthorizedUserInfo)
      .post('', this.create.bind(this))
  }

  async getAll(request, response, next) {
    try {
      response.send(['value1', 'value2'])
    } catch (error) {
      next(error)
    }
  }

  async getOneValue(request, response, next) {
    try {
      const value = await valuesService.findById(request.params.id)
      response.send(value)
    } catch (error) {
      next(error)
    }
  }

  /**
 * Creates a new value from request body and returns the value
 * @param {import("express").Request} request
 * @param {import("express").Response} response
 * @param {import("express").NextFunction} next
 */
  async create(request, response, next) {
    try {
      // NOTE NEVER TRUST THE CLIENT TO ADD THE CREATOR ID
      request.body.creatorId = request.userInfo.id

      response.send(request.body)
    } catch (error) {
      next(error)
    }
  }
}