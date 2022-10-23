var fs = require('fs');
var dir = 'data/uploads';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const multer = require('multer')
let upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'data/uploads')
    },
    filename: (req, file, cb) => {
      let fileExtension = file.originalname.split('.') // get file extension from original file name            
      fileExtension = fileExtension[fileExtension.length - 1] // get file extension from original file name 
      let name = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      cb(null, Date.now() + '.' + name + '.' + fileExtension)
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/gif") {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error('Only .png, .jpg and .jpeg formats allowed!')
      err.name = 'ExtensionError'
      return cb(err);
    }
  }
})

module.exports = upload;