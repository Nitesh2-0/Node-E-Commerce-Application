const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

/* Product Image Handler */
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function(req, file, cb) {
    const fn = crypto.randomBytes(20).toString('hex') + path.extname(file.originalname);
    cb(null, fn);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};

/* Profile Image Handler */
const storageSingle = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'public/profiles');
  },
  filename : function (req, file, cb) {
    const filename = crypto.randomBytes(20).toString('hex') + path.extname(file.originalname);
    cb(null, filename)
  }
});

const uploadSingle = multer({ storage: storageSingle });
const upload = multer({ storage: storage , fileFilter: fileFilter});

module.exports = {
  upload,
  uploadSingle
};