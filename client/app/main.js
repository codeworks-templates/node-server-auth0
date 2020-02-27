import { AuthController } from "./auth/AuthController.js";
import { resource } from "./resource.js";

class App {
  authController = new AuthController();
}

window["app"] = new App();
