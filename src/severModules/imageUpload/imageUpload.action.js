const multer = require("multer");
const imageUpload = require("../../models/imageUpload");
const { UploadToGDrive } = require("../gdrive");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const Image = imageUpload;

const UploadImage = async (req, res) => {
  const { filename, path } = req.file;
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
    res.send("Image uploaded");
  } catch (error) {
    res.status(400).send({ message: "Image upload failed" });
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
