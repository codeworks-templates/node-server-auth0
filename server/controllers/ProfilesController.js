import express from "express";
import BaseController from "../utils/BaseController";
import { profilesService } from "../services/ProfilesService";
import { Auth0Provider } from "@bcwdev/auth0provider";

export class ProfilesController extends BaseController {
  constructor() {
    super("api/profile");
    this.router
      .use(Auth0Provider.getAuthorizedUserInfo)
      .get("", this.getUserProfile)
      .put("/:id", this.edit);
  }
  async getUserProfile(req, res, next) {
    try {
      let profile = await profilesService.getProfile(req.userInfo);
      res.send(profile);
    } catch (error) {
      next(error);
    }
  }
  async edit(req, res, next) {
    try {
      req.body.creatorId = req.user.sub;
      res.send(req.body);
    } catch (error) {
      next(error);
    }
  }
}
