import { AuthController } from "./auth/AuthController.js";

class App {
  authController = new AuthController();
}

window["app"] = new App();
