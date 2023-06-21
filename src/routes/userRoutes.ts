import { Router } from "express";
import { AuthenticateJwtAccessToken } from "../services/tokenService";
import { GetUserInfo } from "../services/mongoDBService";

const UserRouter = Router();

UserRouter.route("/getData").get(
  AuthenticateJwtAccessToken,
  async (req, res) => {
    // console.log(req);
    await GetUserInfo(req, res);
  }
);
export default UserRouter;
