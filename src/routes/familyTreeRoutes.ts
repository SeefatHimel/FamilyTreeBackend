import { Router } from "express";
import { GetGoogleLoginLink } from "../severModules/auth/googleSignIn";
import { AuthenticateJwtAccessToken } from "../services/tokenService";
import { CreateFamily, GetFamilyMembers } from "../severModules/family";
import {
  AddMember,
  AddOriginMember,
  DeleteMember,
  UpdateMember,
} from "../severModules/family/memberActions";

const FamilyTreeRouter = Router();

FamilyTreeRouter.route("/getLink").get((req, res) => {
  GetGoogleLoginLink(req, res);
});

FamilyTreeRouter.route("/enter").post(
  AuthenticateJwtAccessToken,
  async (req, res) => {
    CreateFamily(req, res);
    console.log("🚀 ~ file: server.js:121 ~ app.post ~ req.body", req.body);
    // res.status(200).send({ message: "Enter!!" });
  }
);

FamilyTreeRouter.route("/getDetails").get(
  AuthenticateJwtAccessToken,
  async (req, res) => {
    GetFamilyMembers(req, res);
  }
);

FamilyTreeRouter.route("/add").post(
  AuthenticateJwtAccessToken,
  async (req, res) => {
    console.log("/add", req.body, typeof req.body.data);

    try {
      await AddMember(req, res);
      res.status(400).send();
    } catch (error) {
      console.log("🚀 ~ file: server.js:134 ~ app.post ~ error", error);
      res.status(400).send({ message: "Error!!" });
    }
  }
);
FamilyTreeRouter.route("/add/origin").post(
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

FamilyTreeRouter.route("/update").put(
  AuthenticateJwtAccessToken,
  async (req, res) => {
    console.log(req.body);
    try {
      await UpdateMember(req, res);
    } catch (error) {
      console.log("🚀 ~ file: server.js:153 ~ app.post ~ error", error);
      res.status(400).send({ message: "Error!!" });
    }
  }
);

FamilyTreeRouter.route("/delete").post(
  AuthenticateJwtAccessToken,
  async (req, res) => {
    console.log(req.body);
    try {
      await DeleteMember(req, res);
    } catch (error) {
      console.log("🚀 ~ file: server.js:163 ~ app.post ~ error", error);
      res.status(400).send({ message: "Error!!" });
    }
  }
);

export default FamilyTreeRouter;
