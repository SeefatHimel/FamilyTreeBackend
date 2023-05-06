import { extname } from "path";
import multer, { diskStorage } from "multer";

export default multer({
  storage: diskStorage({}),
  fileFilter: (req, file, cb) => {
    const ext = extname(file.originalname);
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
