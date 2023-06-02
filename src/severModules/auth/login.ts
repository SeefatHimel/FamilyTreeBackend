import User from "../../models/user";
import { GetDataFromDBbyEmail } from "../../services/mongoDBService";
import {
  GenerateJwtAccessToken,
  SaveJwtRefreshToken,
} from "../../services/tokenService";
import { GetValidUserData } from "../../services/userData";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

async function signIn(req: any, res: any) {
  console.log("email : ", req.body.email, " Pass : ", req.body.password);
  if (!req.body.email) {
    console.log("Request email was empty.");
    return res.status(400).send({
      message: "Request email was empty.",
    });
  }
  try {
    await User.findOne(
      { email: req.body.email },
      async function (err: any, user: any) {
        if (err) console.error(err);
        if (!user) {
          console.log("User not found.");
          return res.status(400).send({
            message: "User not found.",
          });
        } else {
          console.log("user > ", user);
          if (user.validPassword(req.body.password)) {
            const accessToken = await GenerateJwtAccessToken({
              id: user?.id,
              name: user?.name,
              email: user?.email,
            });
            const refreshToken = jwt.sign(
              {
                id: user?.id,
                name: user?.name,
                email: user?.email,
              },
              process.env.REFRESH_TOKEN_SECRET as any
            );
            console.log({
              accessToken: accessToken,
              refreshToken: refreshToken,
            });
            const savedJwtRefreshToken = await SaveJwtRefreshToken(
              user?.email,
              refreshToken
            );
            const userArray: any = await GetDataFromDBbyEmail(req.body.email);
            const userData = GetValidUserData(userArray[0]);
            console.log("userData > ", userData);
            if (savedJwtRefreshToken && userData) {
              res.cookie("accessToken", accessToken, {
                secure: true,
                sameSite: "strict",
              });
              res.cookie("refreshToken", refreshToken, {
                secure: true,
                sameSite: "strict",
              });
              res.cookie("user", userData.name, {
                secure: true,
                sameSite: "strict",
              });
              res.cookie("activeUserID", user?.id, {
                secure: true,
                sameSite: "strict",
              });
              console.log("...............................");
              res.send({
                accessToken: accessToken,
                refreshToken: refreshToken,
                userData: userData,
                message: "Logged in successfully",
              });
              console.log("...............................");
            } else {
              console.log("signIn - Failed to save token");
              res.status(400).send({
                message: "Failed to save token",
              });
            }
          } else {
            return res.status(400).send({
              message: "Wrong Password",
            });
          }
        }
      }
    ).clone();
  } catch (error) {
    console.log("Sign in Error : ", error);
    return res.status(400).send({
      message: "User not found.",
    });
  }
}

// type userType = {
//   id: string;
//   email: string;
//   verified_email: boolean;
//   name: string;
//   picture: string;
//   locale: string;
// };
export { signIn };
