const http = require("http");
const https = require("https");
const fs = require("fs");
const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
// const upload = multer({ storage });

async function DownloadImageFromUrl(member) {
  const imageUrl = member.imgLink;
  const destinationPath = "uploads2/" + member.name + ".jpg";

  const protocol = imageUrl.startsWith("https") ? https : http;
  const request = protocol.get(imageUrl, (response) => {
    if (response.statusCode !== 200) {
      console.error(
        `Failed to download image: ${response.statusCode} ${response.statusMessage}`
      );
      return;
    }
    const dest = fs.createWriteStream(destinationPath);
    response.pipe(dest);
    dest.on("finish", () => {
      console.log("Image downloaded successfully");
    });
  });

  request.on("error", (error) => {
    console.error("Error downloading image:", error);
  });

  request.end();
}

module.exports = { DownloadImageFromUrl };
