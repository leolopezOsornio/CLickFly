const { Storage } = require("@google-cloud/storage");
const path = require("path");

const storage = new Storage({
    keyFilename: path.join(__dirname, "./storage_leo.json"), // Ruta al archivo JSON
});

const bucketName = "leo_correos"; // Reemplázalo con el nombre de tu bucket
const bucket = storage.bucket(bucketName);

module.exports = { bucket };
