const express = require('express');
const validate = require('../middlewares/validate');
const { adminController } = require('../controllers');
const { adminValidation } = require('../validations');
const auth = require('../middlewares/auth.middleware');

const multer = require('multer')
let upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'data/uploads')
    },
    filename: (req, file, cb) => {
      let fileExtension = file.originalname.split('.')[1] // get file extension from original file name
      cb(null, `avatar.${fileExtension}`)
    }
  })
})

const router = express.Router();

router
  .route('/')
  .get(auth(true), adminController.getAdmin)
  .put(auth(true), validate(adminValidation.updateBlog), adminController.updateBlog);

router.route('/install')
  .get(auth(false), adminController.install)
  .post(validate(adminValidation.install), adminController.install);

router.route('/photo')
  .get(auth(true), adminController.getPhoto)
  .post(auth(true), validate(adminValidation.updatePhoto), upload.single('profile_photo'), adminController.updatePhoto)
  .delete(auth(true), adminController.deletePhoto);

router.use('/auth', require('./auth.route'));

module.exports = router;