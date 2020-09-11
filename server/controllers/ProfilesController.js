import { Auth0Provider } from "@bcwdev/auth0provider";
import { profilesService } from "../services/ProfilesService";
import BaseController from "../utils/BaseController";

export class ProfilesController extends BaseController {
  constructor() {
    super("profile");
    this.router
      .use(Auth0Provider.getAuthorizedUserInfo)
      .get("", this.getUserProfile)
  }
  async getUserProfile(req, res, next) {
    try {
      let profile = await profilesService.getProfile(req.userInfo);
      res.send(profile);
    } catch (error) {
      next(error);
    }
  }
}
