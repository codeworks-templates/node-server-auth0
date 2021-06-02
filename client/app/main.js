import { AuthController } from './Controllers/AuthController.js'
import { SocketTestController } from './Controllers/SocketTestController.js'
import { ValuesController } from './Controllers/ValuesController.js'

class App {
  authController = new AuthController();
  valuesController = new ValuesController();
  socketTestController = new SocketTestController();
}

// @ts-ignore
window.app = new App()
