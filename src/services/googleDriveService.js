const fs = require("fs");
const { google } = require("googleapis");

/**
 * Browse the link below to see the complete object returned for folder/file creation and search
 *
 * @link https://developers.google.com/drive/api/v3/reference/files#resource
 */
var PartialDriveFile = {
  id: "",
  name: "",
};

var SearchResultResponse = {
  kind: "drive#fileList",
  nextPageToken: "",
  incompleteSearch: false,
  files: [],
};

function GoogleDriveService(clientId, clientSecret, redirectUri, refreshToken) {
  this.driveClient = this.createDriveClient(
    clientId,
    clientSecret,
    redirectUri,
    refreshToken
  );
}

GoogleDriveService.prototype.createDriveClient = function (
  clientId,
  clientSecret,
  redirectUri,
  refreshToken
) {
  var client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  client.setCredentials({ refresh_token: refreshToken });

  return google.drive({
    version: "v3",
    auth: client,
  });
};

GoogleDriveService.prototype.createFolder = function (folderName) {
  return this.driveClient.files.create({
    resource: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id, name",
  });
};

GoogleDriveService.prototype.searchFolder = function (folderName) {
  var self = this;

  return new Promise(function (resolve, reject) {
    self.driveClient.files.list(
      {
        q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
        fields: "files(id, name)",
      },
      function (err, res) {
        if (err) {
          return reject(err);
        }

        return resolve(res.data.files ? res.data.files[0] : null);
      }
    );
  });
};

GoogleDriveService.prototype.saveFile = function (
  fileName,
  filePath,
  fileMimeType,
  folderId
) {
  return this.driveClient.files.create({
    requestBody: {
      name: fileName,
      mimeType: fileMimeType,
      parents: folderId ? [folderId] : [],
    },
    media: {
      mimeType: fileMimeType,
      body: fs.createReadStream(filePath),
    },
  });
};

module.exports = GoogleDriveService;
