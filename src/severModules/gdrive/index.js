var dotenv = require("dotenv");
var path = require("path");
var fs = require("fs");
const GoogleDriveService = require("../../services/googleDriveService");

// var GoogleDriveService = require("./googleDriveService").GoogleDriveService;

dotenv.config();

var driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID || "";
var driveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || "";
var driveRedirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || "";
var driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || "";
var googleDriveService = new GoogleDriveService(
  driveClientId,
  driveClientSecret,
  driveRedirectUri,
  driveRefreshToken
);
async function UploadToGDrive(image) {
  var finalPath = path.resolve(__dirname + "../../../../", image.path);
  console.log(
    "🚀 ~ file: index.js:22 ~ UploadToGDrive ~ __dirname, image.path",
    __dirname,
    image.path
  );
  console.log("🚀 ~ file: index.js:27 ~ UploadToGDrive ~ finalPath", finalPath);
  var folderName = "Picture";

  if (!fs.existsSync(finalPath)) {
    console.log("File not found!");
    throw new Error("File not found!");
  }

  googleDriveService
    .searchFolder(folderName)
    .then(function (folder) {
      if (!folder) {
        return googleDriveService.createFolder(folderName);
      }
      return folder;
    })
    .then(function (folder) {
      return googleDriveService.saveFile(
        image.name,
        finalPath,
        "image/jpg",
        folder.id
      );
    })
    .then(function () {
      console.info("File uploaded successfully!");

      // Delete the file on the server
      // fs.unlinkSync(finalPath);
    })
    .catch(function (error) {
      console.error(error);
    });
}

const GetGDrivePictures = async () => {
  const folder = await googleDriveService.searchFolder("Picture");
  console.log("🚀 ~ file: index.js:58 ~ GetGDrivePictures ~ folder", folder);
  //  googleDriveService.files.list
  // console.log(
  //   "🚀 ~ file: index.js:61 ~ GetGDrivePictures ~  googleDriveService.files.list",
  //   googleDriveService?.driveClient?.files
  // );
  const drive = googleDriveService?.driveClient;
  drive.files.list(
    {
      q: `'${folder.id}' in parents and (mimeType="image/jpeg" or mimeType="image/png")`,
      fields: "files(name, id , mimeType)",
    },
    (err, res) => {
      if (err) {
        console.error("Error retrieving files:", err);
        return;
      }
      const files = res.data.files;
      const nFiles = [];
      if (files.length) {
        console.log("Downloading files:");
        files.forEach((file) => {
          console.log(`- ${file.name} fileId: ${file.id}`);
          const dest = fs.createWriteStream(`./uploads/${file.name}`);
          drive.files
            .get({ fileId: file.id, alt: "media" }, { responseType: "stream" })
            .then((res) => {
              res.data.pipe(dest);
              dest.on("close", () => {
                const mimeType = file.mimeType;
                const extension =
                  mimeType === "image/jpeg"
                    ? ".jpg"
                    : mimeType === "image/png"
                    ? ".png"
                    : mimeType === "image/gif"
                    ? ".gif"
                    : "";
                if (extension) {
                  try {
                    fs.renameSync(
                      `./uploads/${file.name}`,
                      `./uploads/${path.parse(file.name).name}${extension}`
                    );
                  } catch (error) {
                    console.log("Rename Failed", error);
                  }
                }
              });
              console.log("Downloaded");
            })
            .catch((err) => {
              response.status(401).send();
              console.error(`Error downloading file "${file.name}":`, err);
            });
        });
      } else {
        console.log("No files found.");
      }
      // if (files.length) {
      //   console.log("Files:");
      //   files.forEach((file) => {
      //     nFiles.push({
      //       name: file.name,
      //       webViewLink: file.webViewLink,
      //     });
      //     console.log(`${file.name}: ${file.webViewLink}`);
      //   });
      //   const dest = fs.createWriteStream(`./uploads/${file.name}`);
      //   drive.files
      //     .get({ fileId: file.id, alt: "media" }, { responseType: "stream" })
      //     .then((res) => {
      //       res.data.pipe(dest);
      //     })
      //     .catch((err) => {
      //       console.error(`Error downloading file "${file.name}":`, err);
      //     });
      //   response.send({ files: files });
      // } else {
      //   console.log("No files found.");
      // }
    }
  );
  // This will print out the names and web view links of the image files in your Google Drive. You can use the web view link as the URL to access the image in a web browser.
};

module.exports = { UploadToGDrive, GetGDrivePictures };
