const FamilyList = require("../../models/familyList");
const { v4: uuidv4 } = require("uuid");

async function CreateFamily(req, res) {
  const data = req.body;
  console.log("🚀 ~ file: index.js:6 ~ CreateFamily ~ data", data);
  const oldFamily = await FamilyList.where("name").equals(data.name);
  if (oldFamily && oldFamily[0]) {
    console.log("Name already Exists");
    await GetFamily(req, res);
  } else {
    const newFamily = new FamilyList();
    newFamily.name = data.name;
    newFamily.id = uuidv4();
    newFamily.password = data.password;
    newFamily.setPassword(data.password);

    // Save newFamily object to database
    try {
      newFamily.save((err, FamilyList) => {
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

async function GetFamilyMembers(req, res) {
  const familyId = req.query.familyId ? req.query.familyId : req.body.familyId;

  console.log("🚀 ~ file: index.js:51 ~ GetFamilyMembers ~ familyId", familyId);
  const fDetails = await FamilyList.where("id").equals(familyId);
  const familyName = fDetails[0].name;
  console.log(
    "🚀 ~ file: index.js:54 ~ GetFamilyMembers ~ familyName",
    familyName
  );
  if (familyName) {
    try {
      const Members = require("../../models/familyMember")(familyId);
      const members = await Members.find();
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
  } else
    res.status(404).send({
      message: "Family Not Found",
    });
}

async function GetFamily(req, res) {
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
      async function (err, family) {
        if (err) console.error(err);
        if (!family) {
          console.log("FamilyList not found.");
          return res.status(400).send({
            message: "FamilyList not found.",
          });
        } else {
          console.log("family > ", family);
          if (family.validPassword(req.body.password)) {
            const Members = require("../../models/familyMember")(family.id);
            const members = await Members.find();

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

module.exports = { CreateFamily, GetFamilyMembers };
