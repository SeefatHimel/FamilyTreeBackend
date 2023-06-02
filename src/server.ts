import { connect } from "mongoose";
import { signIn } from "./severModules/auth/login";
import {
  GetJwtAccessToken,
  AuthenticateJwtAccessToken,
} from "./services/tokenService";

import pkg from "body-parser";
const { json, urlencoded } = pkg;

import dotenv from "dotenv";
dotenv.config();

import express, { json as _json } from "express";
import cors from "cors";

import userTokens from "./models/userTokens";
import { GetUserInfo } from "./services/mongoDBService";

import {
  GoogleLogin,
  GetGoogleLoginLink,
} from "./severModules/auth/googleSignIn";
import { CheckEmailValidity, RegisterUser } from "./severModules/auth/signUp";

import {
  AddMember,
  DeleteMember,
  UpdateMember,
  AddOriginMember,
} from "./severModules/family/memberActions";

import { CreateFamily, GetFamilyMembers } from "./severModules/family";

const app = express();

connect(
  "mongodb+srv://himel:himel@cluster0.6uvuj.mongodb.net/familyTree",
  function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log("connected");
    }
  }
);
const corsOptions = {
  origin: true, //included origin as true

  credentials: true, //included credentials as true
};
app.use(cors(corsOptions));
app.use(_json());
// Parse incoming request bodies
app.use(json());
app.use(urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send({ hello: "hello" });
});

app.post("/token", async (req, res) => {
  const refreshToken = req.body.token;
  await GetJwtAccessToken(refreshToken, res);
});

app.get("/getLink", (req, res) => {
  GetGoogleLoginLink(req, res);
});

app.get("/login", async (req, res) => {
  const code = req.query.code ? req.query.code : req.body.code;
  console.log("Code ", code);
  await GoogleLogin(code, res);
});

app.get("/getData", AuthenticateJwtAccessToken, async (req, res) => {
  // console.log(req);
  await GetUserInfo(req, res);
});

app.post("/signUp", async (req, res) => {
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

app.post("/signIn", async (req, res) => {
  await signIn(req, res);
});

app.post("/register_email", async (req, res) => {
  CheckEmailValidity(req, res);
});

app.post("/logout", async (req, res) => {
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

app.post("/familyTree/enter", AuthenticateJwtAccessToken, async (req, res) => {
  CreateFamily(req, res);
  console.log("🚀 ~ file: server.js:121 ~ app.post ~ req.body", req.body);
  // res.status(200).send({ message: "Enter!!" });
});

app.get(
  "/familyTree/getDetails",
  AuthenticateJwtAccessToken,
  async (req, res) => {
    GetFamilyMembers(req, res);
  }
);

app.post("/familyTree/add", AuthenticateJwtAccessToken, async (req, res) => {
  console.log("/familyTree/add", req.body, typeof req.body.data);

  try {
    await AddMember(req, res);
    res.status(400).send();
  } catch (error) {
    console.log("🚀 ~ file: server.js:134 ~ app.post ~ error", error);
    res.status(400).send({ message: "Error!!" });
  }
});
app.post(
  "/familyTree/add/origin",
  AuthenticateJwtAccessToken,
  async (req, res) => {
    console.log(req.body);
    try {
      await AddOriginMember(req, res);
    } catch (error) {
      console.log("🚀 ~ file: server.js:143 ~ app.post ~ error", error);
      res.status(400).send({ message: "Error!!" });
    }
  }
);

app.put("/familyTree/update", AuthenticateJwtAccessToken, async (req, res) => {
  console.log(req.body);
  try {
    await UpdateMember(req, res);
  } catch (error) {
    console.log("🚀 ~ file: server.js:153 ~ app.post ~ error", error);
    res.status(400).send({ message: "Error!!" });
  }
});

app.post("/familyTree/delete", AuthenticateJwtAccessToken, async (req, res) => {
  console.log(req.body);
  try {
    await DeleteMember(req, res);
  } catch (error) {
    console.log("🚀 ~ file: server.js:163 ~ app.post ~ error", error);
    res.status(400).send({ message: "Error!!" });
  }
});

app.listen(3000, () => {
  console.log("Server running");
});
