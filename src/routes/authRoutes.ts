import { Router } from "express";
import { GetJwtAccessToken } from "../services/tokenService";
import {
  GetGoogleLoginLink,
  GoogleLogin,
} from "../severModules/auth/googleSignIn";
import { CheckEmailValidity, RegisterUser } from "../severModules/auth/signUp";
import { signIn } from "../severModules/auth/login";
import userTokens from "../models/userTokens";

const AuthRouter = Router();

AuthRouter.route("/token")
  .get()
  .post(async (req, res) => {
    const refreshToken = req.body.token;
    await GetJwtAccessToken(refreshToken, res);
  });

AuthRouter.route("/getLink").get((req, res) => {
  GetGoogleLoginLink(req, res);
});

AuthRouter.route("/login").get(async (req, res) => {
  const code = req.query.code ? req.query.code : req.body.code;
  console.log("Code ", code);
  await GoogleLogin(code, res);
});

AuthRouter.route("/signUp").post(async (req, res) => {
  console.log("/signUp : ", req.body);
  try {
    const userRegistered = await RegisterUser(req.body.data, res);
    if (userRegistered) {
      console.log("/signUp", "Successful !");
    }
  } catch (error) {
    console.log("signUp catch error > ", error);
    console.log("Failed to signUp.");
    res.status(400).send({
      message: "Failed to signUp.",
    });
  }
});

AuthRouter.route("/signIn").post(async (req, res) => {
  await signIn(req, res);
});

AuthRouter.route("/register_email").post(async (req, res) => {
  CheckEmailValidity(req, res);
});

AuthRouter.route("/logout").post(async (req, res) => {
  const tokens = await userTokens.find().clone();
  if (tokens[0]) {
    try {
      await userTokens.deleteMany({});
      console.log("Refresh Tokens Deleted");
      res.status(200).send({ message: "Logged out!!" });
    } catch (e: any) {
      console.log(e.message);
      res.status(400).send({ message: "Error!!" });
    }
  } else res.status(200).send({ message: "Logged out!!" });
});

export default AuthRouter;
