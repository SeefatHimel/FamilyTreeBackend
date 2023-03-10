const { v4: uuidv4 } = require("uuid");
const { CheckGDrivePictures } = require("../gdrive");
async function AddMember(req, res) {
  const formData = JSON.parse(req.body.data);
  const { familyId, data, memId } = formData;
  const Members = require("../../models/familyMember")(familyId);
  let tmpMem = await Members.where("id").equals(memId).clone();

  if (data.relation === "Sibling") {
    tmpMem = await Members.where("id").equals(tmpMem[0].parents[0]).clone();
  }
  const rMember = tmpMem[0];
  console.log("🚀 ~ file: addMember.js:10 ~ AddMember ~ rMember", rMember);

  const sameName = await Members.where("name").equals(data.name).clone();
  if (sameName && sameName[0]) {
    console.log("sameName", sameName);
    res.status(401).send({
      message: "Name Already used.",
    });
  } else {
    try {
      let parents = [];
      let children = [];
      let spouse = [];
      const newMemberId = uuidv4();
      if (data?.relation) {
        if (data.relation === "Parent") {
          children.push(rMember.id);
          rMember.parents.push(newMemberId);
        }
        if (data.relation === "Child" || data.relation === "Sibling") {
          parents.push(rMember.id);
          rMember.children.push(newMemberId);
        }
        if (data.relation === "Spouse") {
          spouse.push(rMember.id);
          rMember.spouse.push(newMemberId);
        }
      }
      Members.findByIdAndUpdate(
        rMember._id,
        rMember,
        function (err, updatedData) {
          if (err) {
            console.log(err);
          } else {
            console.log("Parent Updated ", updatedData);

            //res.redirect or res.send whatever you want to do
          }
        }
      ).clone;
      const file = req.file;
      const member = await Members.create({
        id: newMemberId,
        name: data.name,
        imgLink: data.imgLink ? data.imgLink : null,
        imgPath: file?.path ? file.path : null,
        gender: data.gender,
        parents: parents,
        children: children,
        spouse: spouse,
      });

      console.log("Member Added ", member);
      res.status(201).send({
        message: "Member added successfully.",
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        message: "Failed to add Member.",
      });
    }
  }
}
async function AddOriginMember(req, res) {
  const formData = JSON.parse(req.body.data);
  const { familyId, data, memId } = formData;
  const Members = require("../../models/familyMember")(familyId);

  console.log(
    "🚀 ~ file: memberActions.js:83 ~ AddOriginMember ~ req.file:",
    req.file
  );
  const sameName = await Members.where("name").equals(data.name).clone();
  if (sameName && sameName[0]) {
    console.log("sameName", sameName);
    res.status(401).send({
      message: "Name Already used.",
    });
  } else {
    try {
      let parents = [];
      let children = [];
      let spouse = [];
      const newMemberId = uuidv4();
      if (data?.relation) {
        if (data.relation === "Parent") {
          children.push(rMember.id);
          rMember.parents.push(newMemberId);
        }
        if (data.relation === "Child" || data.relation === "Sibling") {
          parents.push(rMember.id);
          rMember.children.push(newMemberId);
        }
        if (data.relation === "Spouse") {
          spouse.push(rMember.id);
          rMember.spouse.push(newMemberId);
        }
      }
      const member = await Members.create({
        id: newMemberId,
        name: data.name,
        imgLink: data.imgLink,
        imgPath: req.file.path ? req.file.path : null,
        gender: data.gender,
        parents: parents,
        children: children,
        spouse: spouse,
      });

      console.log("Origin Member Added ", member);
      res.status(201).send({
        message: "Origin Member added successfully.",
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        message: "Failed to add Origin Member.",
      });
    }
  }
}
async function DeleteChildren(Members, id) {
  console.log("🚀 ~ file: addMember.js:75 ~ DeleteChildren ~ id", id);
  let tmpMem = await Members.where("id").equals(id).clone();
  const member = tmpMem[0];

  let childDeleted = true;
  if (member) {
    if (member.children.length > 0) {
      member.children.map(
        (childDeleted *= async (childId) =>
          await DeleteChildren(Members, childId))
      );
    }
    try {
      await Members.deleteOne({ id: id });
    } catch (error) {
      return false;
    }
    return childDeleted;
  } else return true;
}

async function DeleteMember(req, res) {
  const { familyId, memId } = req.body;
  const Members = require("../../models/familyMember")(familyId);
  let tmpMem = await Members.where("id").equals(memId).clone();
  const member = tmpMem[0];
  let childDeleted = true;
  if (!member) {
    res.status(201).send({
      message: "Was Already Deleted.",
    });
  } else {
    if (member.imgPath) {
      const imgPath = member.imgPath?.slice(8);
      console.log(
        "🚀 ~ file: memberActions.js:165 ~ DeleteMember ~ imgPath:",
        imgPath
      );
      await CheckGDrivePictures(member.imgPath?.slice(8));
    }
    console.log(
      "🚀 ~ file: addMember.js:101 ~ DeleteMember ~ childDeleted",
      childDeleted
    );
    if (member?.children?.length > 0) {
      member.children.map(
        async (childId) =>
          (childDeleted *= await DeleteChildren(Members, childId))
      );
    }
    console.log(
      "🚀 ~ file: addMember.js:101 ~ DeleteMember ~ childDeleted",
      childDeleted
    );
    if (childDeleted) {
      if (member?.parents?.length > 0) {
        let tmpParent = await Members.where("id")
          .equals(member.parents[0])
          .clone();
        const parent = tmpParent[0];
        if (parent) {
          parent.children = parent.children.filter(
            (childId) => childId != memId
          );
          Members.findByIdAndUpdate(
            parent._id,
            parent,
            function (err, updatedData) {
              if (err) {
                console.log(err);
                console.log("Parent Update failed");
              } else {
                console.log("Parent Updated ", updatedData);
                //res.redirect or res.send whatever you want to do
              }
            }
          ).clone;
        }
      }
      if (member.spouse.length > 0) {
        let tmpSpouse = await Members.where("id")
          .equals(member.spouse[0])
          .clone();
        const spouse = tmpSpouse[0];
        if (spouse.parents.length === 0) {
          try {
            await Members.deleteOne({ id: member.spouse[0] });
            console.log("Spouse removed");
          } catch (error) {
            console.log("Spouse remove failed");
          }
        } else {
          spouse.spouse = [];
          Members.findByIdAndUpdate(
            spouse._id,
            spouse,
            function (err, updatedData) {
              if (err) {
                console.log(err);
              } else {
                console.log("Parent Updated ", updatedData);

                //res.redirect or res.send whatever you want to do
              }
            }
          ).clone;
        }
      }
      try {
        await Members.deleteOne({ id: memId });
        res.status(201).send({
          message: "Member Deleted successfully.",
        });
      } catch (error) {
        res.status(400).send({
          message: "Failed to Delete Member.",
        });
      }
    } else {
      res.status(400).send({
        message: "Failed to Delete Children.",
      });
    }
  }
}

async function UpdateMember(req, res) {
  const formData = JSON.parse(req.body.data);
  const { familyId, data, memId } = formData;
  console.log(
    "🚀 ~ file: memberActions.js:247 ~ UpdateMember ~ familyId, data",
    familyId,
    data
  );
  const Members = require("../../models/familyMember")(familyId);
  let tmpMem = await Members.where("id").equals(data.id).clone();
  const rMember = tmpMem[0];
  console.log(
    "🚀 ~ file: memberActions.js:273 ~ UpdateMember ~ rMember:",
    rMember,
    data
  );
  const sameName = await Members.where("name").equals(data.name).clone();
  console.log("Check 1");
  if (sameName[0] && sameName[0]?.id !== data.id) {
    console.log("sameName", sameName);
    res.status(401).send({
      message: "Name Already used.",
    });
  } else {
    try {
      rMember.name = data.name;
      if (data.imgLink) {
        rMember.imgLink = data.imgLink;
        rMember.imgPath &&
          (await CheckGDrivePictures(rMember.imgPath.slice(8)));
        rMember.imgPath = null;
      }
      if (data.imgPath) {
        rMember.imgPath = data.imgPath;
        rMember.imgLink = null;
      }

      Members.findByIdAndUpdate(
        rMember._id,
        rMember,
        function (err, updatedData) {
          if (err) {
            console.log(err);
          } else {
            console.log("Member Updated ", updatedData);
            res.status(201).send({
              message: "Member Updated successfully.",
            });
            //res.redirect or res.send whatever you want to do
          }
        }
      ).clone;
    } catch (error) {
      console.log(error);
      res.status(400).send({
        message: "Failed to Update Member.",
      });
    }
  }
}

module.exports = { AddMember, AddOriginMember, DeleteMember, UpdateMember };
