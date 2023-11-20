import pkg from "jsonwebtoken";
const { sign, verify } = pkg;
import dotenv from "dotenv";
import UserTokens from "../models/userTokens";
import { UserInfo } from "interfaces";
dotenv.config();

async function GenerateJwtAccessToken({ id, name, email }: any) {
  console.log("GenerateJwtAccessToken");
  console.log(
    "process.env.ACCESS_TOKEN_SECRET ",
    process.env.ACCESS_TOKEN_SECRET
  );
  return sign(
    {
      id,
      name,
      email,
    },
    process.env.ACCESS_TOKEN_SECRET as any,
    { expiresIn: "6000s" }
  );
}
async function SaveJwtRefreshToken(email: any, refresh_token: any) {
  const oldToken = await UserTokens.where("refresh_token").equals(
    refresh_token
  );
  console.log(
    "🚀 ~ file: tokenService.ts:28 ~ SaveJwtRefreshToken ~ oldToken:",
    oldToken
  );
  console.log(oldToken);
  if (oldToken[0]) {
    console.log("Token already Exists");
  } else {
    try {
      const newToken = await UserTokens.create({
        email: email,
        refresh_token: refresh_token,
      });
      console.log("Token Added ", newToken);
      return true;
    } catch (e: any) {
      console.log(e.message);
      return false;
    }
  }
}

async function GetJwtAccessToken(refreshToken: any, res: any) {
  console.log("refreshToken > ", refreshToken);
  if (refreshToken == null)
    return res.status(401).send({
      message: "Login Again",
    });
  const refreshTokens: any =
    UserTokens.where("refresh_token").equals(refreshToken);
  if (refreshTokens[0])
    return res.status(403).send({
      message: "Token already exists , Log in Again",
    });
  verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as any,
    async (err: any, user: any) => {
      if (err)
        return res.status(403).send({
          message: "JWT verification Failed. Login Again",
        });
      const accessToken = await GenerateJwtAccessToken({
        id: user?.id,
        name: user?.name,
        email: user?.email,
      });
      console.log("new accessToken ", accessToken);
      res
        .cookie("accessToken", accessToken, {
          secure: true,
          sameSite: "strict",
        })
        .send({ accessToken: accessToken });
      // res.send({ accessToken: accessToken });
    }
  );
}

async function AuthenticateJwtAccessToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  console.log("authHeader ", authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  console.log(">>>>  JwtAccessToken ", token);

  if (!token) {
    console.log("Token not found!");
    return res.status(404).send({
      message: "Token not found!",
    });
  } else {
    verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as any,
      (err: any, data: any) => {
        console.log("AccessToken data ", data);
        console.log("AccessToken err ", err);
        if (err) {
          console.log("AccessToken Expired");
          res.status(401).send({
            message: "AccessToken Expired",
          });
          console.log("AccessToken Expired");
        } else {
          console.log("acs data ", data);
          console.log("data.name ", data.name);
          console.log("req.user before ", req.user);
          req.user = data.name;
          // console.log("req", req);
          console.log("req.user after ", req.user);
          next();
        }
      }
    );
  }
}
async function GetUserInfo(req: any): Promise<UserInfo | null> {
  const authHeader = req.headers["authorization"];
  console.log("authHeader ", authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  console.log(">>>>  JwtAccessToken ", token);
  let res = null;
  if (!token) {
    console.log("Token not found!");
    return null;
  } else {
    verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as any,
      (err: any, data: any) => {
        console.log("AccessToken data ", data);
        if (err) {
          console.log("AccessToken Expired");
          return null;
        } else {
          res = data;
          return data;
        }
      }
    );
  }
  return res;
}

export {
  GenerateJwtAccessToken,
  SaveJwtRefreshToken,
  GetJwtAccessToken,
  AuthenticateJwtAccessToken,
  GetUserInfo,
};
