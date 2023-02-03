const { v4: uuidv4 } = require("uuid");
async function AddMember(req, res) {
  const { familyId, data, memId } = req.body;
  const Member = require("../../models/familyMember")(familyId);
  let tmpMem = await Member.where("id").equals(memId).clone();

  if (data.relation === "Sibling") {
    tmpMem = await Member.where("id").equals(tmpMem[0].parents[0]).clone();
  }
  const rMember = tmpMem[0];
  console.log("🚀 ~ file: addMember.js:10 ~ AddMember ~ rMember", rMember);

  const sameName = await Member.where("name").equals(data.name).clone();
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
      Member.findByIdAndUpdate(
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
      const member = await Member.create({
        id: newMemberId,
        name: data.name,
        imgLink: data.imgLink,
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
  const { familyId, data } = req.body;
  const Member = require("../../models/familyMember")(familyId);

  const sameName = await Member.where("name").equals(data.name).clone();
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
      const member = await Member.create({
        id: newMemberId,
        name: data.name,
        imgLink: data.imgLink,
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
async function DeleteChildren(Member, id) {
  console.log("🚀 ~ file: addMember.js:75 ~ DeleteChildren ~ id", id);
  let tmpMem = await Member.where("id").equals(id).clone();
  const member = tmpMem[0];

  let childDeleted = true;
  if (member) {
    if (member.children.length > 0) {
      member.children.map(
        (childDeleted *= async (childId) =>
          await DeleteChildren(Member, childId))
      );
    }
    try {
      await Member.deleteOne({ id: id });
    } catch (error) {
      return false;
    }
    return childDeleted;
  } else return true;
}

async function DeleteMember(req, res) {
  const { familyId, memId } = req.body;
  const Member = require("../../models/familyMember")(familyId);
  let tmpMem = await Member.where("id").equals(memId).clone();
  const member = tmpMem[0];
  let childDeleted = true;
  if (!member) {
    res.status(201).send({
      message: "Was Already Deleted.",
    });
  } else {
    console.log(
      "🚀 ~ file: addMember.js:101 ~ DeleteMember ~ childDeleted",
      childDeleted
    );
    if (member?.children?.length > 0) {
      member.children.map(
        async (childId) =>
          (childDeleted *= await DeleteChildren(Member, childId))
      );
    }
    console.log(
      "🚀 ~ file: addMember.js:101 ~ DeleteMember ~ childDeleted",
      childDeleted
    );
    if (childDeleted) {
      if (member?.parents?.length > 0) {
        let tmpParent = await Member.where("id")
          .equals(member.parents[0])
          .clone();
        const parent = tmpParent[0];
        if (parent) {
          parent.children = parent.children.filter(
            (childId) => childId != memId
          );
          Member.findByIdAndUpdate(
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
        let tmpSpouse = await Member.where("id")
          .equals(member.spouse[0])
          .clone();
        const spouse = tmpSpouse[0];
        if (spouse.parents.length === 0) {
          try {
            await Member.deleteOne({ id: member.spouse[0] });
            console.log("Spouse removed");
          } catch (error) {
            console.log("Spouse remove failed");
          }
        } else {
          spouse.spouse = [];
          Member.findByIdAndUpdate(
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
        await Member.deleteOne({ id: memId });
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
  const { familyId, data } = req.body;
  const Member = require("../../models/familyMember")(familyId);
  let tmpMem = await Member.where("id").equals(data.id).clone();
  const rMember = tmpMem[0];
  const sameName = await Member.where("name").equals(data.name).clone();
  if (sameName && sameName[0]) {
    console.log("sameName", sameName);
    res.status(401).send({
      message: "Name Already used.",
    });
  } else {
    try {
      rMember.name = data.name;
      rMember.imgLink = data.imgLink;

      Member.findByIdAndUpdate(
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
