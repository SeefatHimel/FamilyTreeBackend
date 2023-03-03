const multer = require("multer");
const imageUpload = require("../../models/imageUpload");
const { UploadToGDrive } = require("../gdrive");
const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    console.log(
      "🚀 ~ file: imageUpload.action.js:10 ~ req:",
      req.body.data,
      req.files,
      file
    );
    const formData = JSON.parse(req.body.data);
    console.log(
      "🚀 🚀🚀🚀~ file: imageUpload.action.js:17 ~ formData:",
      formData
    );

    const extension = path.extname(file.originalname);
    // console.log("🚀 ~ file: imageUpload.action.js:11 ~ formData:", formData);
    cb(null, formData.familyId + "_" + formData.data.name + extension);
    // cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const Image = imageUpload;

const UploadImage = async (req, res) => {
  const { filename, path } = req.file;
  // const formData = JSON.parse(req.body.data);
  // const additionalData = formData.data;
  console.log(
    "🚀 ~ file: imageUpload.action.js:19 ~ UploadImage ~ filename, path",
    filename,
    path
  );

  // Save the image to MongoDB
  const image = new Image({
    name: filename,
    path: path,
  });
  try {
    await image.save();
    console.log("Saved in backend");
    await UploadToGDrive(image);
    console.log("Image uploaded");
    // res.send("Image uploaded");
  } catch (error) {
    console.log("Image upload failed");
    // res.status(400).send({ message: "Image upload failed" });
  }
};

const GetImage = async (req, res) => {
  const image = await Image.find();
  console.log("🚀 ~ file: imageUpload.action.js:37 ~ GetImage ~ image", image);

  const imgUrl = image[0].path;
  console.log(
    "🚀 ~ file: imageUpload.action.js:40 ~ GetImage ~ imgUrl",
    imgUrl
  );
  // res.sendFile(`${image[0].path}`, { root: "." });

  res.send({
    data: image[0],
    message: "Image Found",
  });
};

module.exports = { UploadImage, GetImage, upload };
