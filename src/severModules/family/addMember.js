const { v4: uuidv4 } = require("uuid");
async function AddMember(req, res) {
  // if(!id)
  // {

  // }
  const { id, data, memId } = req.body;
  const Member = require("../../models/familyMember")(id);
  let tmpMem = await Member.where("id").equals(memId).clone();

  if (data.relation === "Sibling") {
    tmpMem = await Member.where("id").equals(tmpMem[0].parents[0]).clone();
  }
  const rMember = tmpMem[0];
  console.log("🚀 ~ file: addMember.js:10 ~ AddMember ~ rMember", rMember);

  const sameName = await Member.where("name").equals(data.name).clone();
  if (sameName && sameName[0]) {
    console.log("sameName", sameName);
    res.status(404).send({
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
      await Member.findByIdAndUpdate(
        rMember._id,
        rMember,
        function (err, updatedData) {
          if (err) {
            console.log(err);
          } else {
            console.log("Member Updated ", updatedData);
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
        message: "Family added successfully.",
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        message: "Failed to add Member.",
      });
    }
  }
}

module.exports = { AddMember };
