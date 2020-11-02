/* eslint-disable node/no-path-concat */
import fs from 'fs'
import BaseController from './server/utils/BaseController'
import { logger } from './server/utils/Logger'

export class Paths {
  static get Public() {
    return `${__dirname}/client/`
  }

  static get Server() {
    return `${__dirname}/server`
  }

  static get Controllers() {
    return this.Server + '/controllers'
  }
}

export function RegisterControllers(router) {
  const controllers = fs.readdirSync(Paths.Controllers)
  controllers.forEach(loadController)
  async function loadController(controllerName) {
    try {
      if (!controllerName.endsWith('.js')) return
      const fileHandler = await import(Paths.Controllers + '/' + controllerName)
      let ControllerClass = fileHandler[controllerName.slice(0, -3)]
      if (ControllerClass.default) {
        ControllerClass = ControllerClass.default
      }
      const controller = new ControllerClass()
      if (controller instanceof BaseController) {
        router.use(controller.mount, controller.router)
      }
    } catch (e) {
      logger.error(
        '[CONTROLLER ERROR] unable to load controller, potential duplication, review mount path and controller class name, and see error below',
        controllerName,
        e
      )
    }
  }
}
