import { FamilyListInterface } from "interfaces";
import { v4 as uuidv4 } from "uuid";

import FamilyList from "../../models/familyList";
import FamilyMember from "../../models/familyMember";
import { GetUserInfo } from "../../services/tokenService";

async function CreateFamily(req: any, res: any) {
  const data: any = req.body;
  console.log("🚀 ~ file: index.js:6 ~ CreateFamily ~ data", data);
  const oldFamily = await FamilyList.where("name").equals(data.name);
  if (oldFamily && oldFamily[0]) {
    console.log("Name already Exists");
    await GetFamily(req, res);
  } else {
    const newFamily: FamilyListInterface = new FamilyList();
    newFamily.name = data.name;
    newFamily.id = uuidv4();
    if (newFamily.setPassword) newFamily.setPassword(data.password as any);
    const userInfo: any = await GetUserInfo(req);
    newFamily.creator = userInfo?.id;

    newFamily.users = [userInfo?.id];

    // Save newFamily object to database
    try {
      newFamily.save((err: any, FamilyList: any) => {
        if (err) {
          console.log(err);
          console.log("Failed to add Family.");
          return res.status(400).send({
            message: "Failed to add Family.",
          });
        } else {
          console.log("Family added successfully.");
          return res.status(201).send({
            message: "Family added successfully.",
            id: newFamily.id,
            details: {
              members: [],
              name: newFamily.name,
            },
          });
        }
      });
    } catch (error) {
      console.log("error > ", error);
      console.log("Failed to add Family.");
      return res.status(400).send({
        message: "Failed to add Family.",
      });
    }
  }
}

async function GetFamilyMembers(req: any, res: any) {
  const familyId = req.query.familyId ? req.query.familyId : req.body.familyId;
  console.log(
    "🚀 ~ file: index.ts:58 ~ GetFamilyMembers ~ familyId:",
    familyId
  );
  const userInfo = await GetUserInfo(req);
  if (!userInfo) {
    return res.status(404).send({
      message: "User Not Found",
    });
  }

  console.log("🚀 ~ file: index.js:51 ~ GetFamilyMembers ~ familyId", familyId);
  const fDetails = await FamilyList.findOne({ id: familyId });

  console.log(
    "🚀 ~ file: index.ts:67 ~ GetFamilyMembers ~ fDetails:",
    fDetails
  );
  // .where("id").equals(familyId);

  if (!fDetails) {
    return res.status(404).send({
      message: "Family Not Found",
    });
  }

  const familyName = fDetails?.name;
  console.log(
    "🚀 ~ file: index.js:54 ~ GetFamilyMembers ~ familyName",
    familyName
  );
  if (familyName) {
    try {
      const members = await FamilyMember.find({ familyId });
      // console.log(
      //   "🚀 ~ file: index.js:56 ~ GetFamilyMembers ~ members",
      //   members
      // );
      res.send({
        id: familyId,
        details: {
          name: familyName,
          members: members,
        },
        message: "Family details acquired",
      });
    } catch (error) {
      console.log("GetFamilyMembers Error ", error);
      res.status(400).send({
        message: "Failed to Acquire Family Details",
      });
    }
  }
}

async function GetFamily(req: any, res: any) {
  console.log("Name : ", req.body.name, " Pass : ", req.body.password);
  if (!req.body.name) {
    console.log("Request name was empty.");
    return res.status(400).send({
      message: "Request name was empty.",
    });
  }
  try {
    await FamilyList.findOne(
      { name: req.body.name },
      async function (err: any, family: any) {
        if (err) console.error(err);
        if (!family) {
          console.log("FamilyList not found.");
          return res.status(400).send({
            message: "FamilyList not found.",
          });
        } else {
          console.log("family > ", family);
          if (family.validPassword(req.body.password)) {
            const members = await FamilyMember.find({ familyId: family?.id });

            res.cookie("activeFamilyID", family?.id, {
              secure: true,
              sameSite: "strict",
            });
            console.log("...............................");
            res.send({
              id: family?.id,
              details: {
                name: family?.name,
                members: members,
              },
              message: "Logged in successfully",
            });
            console.log("...............................");
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
      message: "FamilyList not found.",
    });
  }
}

async function GetFamilyList(req: any, res: any) {
  const userInfo: any = await GetUserInfo(req);
  console.log("🚀 ~ file: index.ts:145 ~ GetFamilyList ~ userInfo:", userInfo);

  // Save newFamily object to database
  try {
    const families = await FamilyList.find({ users: { $in: [userInfo.id] } })
      .select("id name createdAt updatedAt creator originMember users viewers")
      .exec();
    if (!families || families.length === 0) {
      console.log("FamilyList not found.");
      return res.status(400).send({
        message: "FamilyList not found.",
      });
    } else {
      console.log("families > ", families);
      res.send(families);
      console.log("...............................");
    }
  } catch (error) {
    console.log("error > ", error);
    console.log("Failed to add Family.");
    return res.status(400).send({
      message: "Failed to add Family.",
    });
  }
}

export { CreateFamily, GetFamilyMembers, GetFamilyList };
