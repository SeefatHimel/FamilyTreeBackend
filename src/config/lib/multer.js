const path = require("path");
const multer = require("multer");

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      cb(new Error("Only pictures are allowed."), false);
      return;
    }

    cb(null, true);
  },
  limits: {
    fieldNameSize: 2 * 1024 * 1024,
  },
});