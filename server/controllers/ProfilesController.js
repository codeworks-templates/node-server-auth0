import express from "express";
import BaseController from "../utils/BaseController";
import auth0Provider from "@bcwdev/auth0Provider";
import { profilesService } from "../services/ProfilesService";

export class ProfilesController extends BaseController {
  constructor() {
    super("/profile");
    this.router = express
      .Router()
      .use(auth0Provider.isAuthorized)
      .get("", this.getUserProfile)
      .put("/:id", this.edit);
  }
  async getUserProfile(req, res, next) {
    try {
      let profile = await profilesService.getProfile(req.user);
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
