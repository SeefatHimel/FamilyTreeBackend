import pkg from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { json as _json } from "express";

import { ConnectDatabase } from "../config/database";
import AuthRouter from "./routes/authRoutes";
import FamilyTreeRouter from "./routes/familyTreeRoutes";
import UserRouter from "./routes/userRoutes";

const { json, urlencoded } = pkg;

dotenv.config();

const app = express();
ConnectDatabase();
const corsOptions = {
  origin: true, //included origin as true

  credentials: true, //included credentials as true
};
app.use(cors(corsOptions));
app.use(_json());
// Parse incoming request bodies
app.use(json());
app.use(urlencoded({ extended: true }));

app.use("/auth", AuthRouter);
app.use("/familyTree", FamilyTreeRouter);
app.use("/user", UserRouter);

app.get("/", (req, res) => {
  res.send({ hello: "hello" });
});

app.listen(3000, () => {
  console.log("Server running");
});
