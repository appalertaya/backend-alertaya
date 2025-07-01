const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por imagen
    files: 5 // máximo 5 imágenes
  }
});

module.exports = upload;
