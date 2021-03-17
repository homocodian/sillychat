const multer = require('multer');
const path = require('path');

// configuring multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}`+ path.extname(file.originalname));
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if (ext !== '.jpg' && ext !== '.png' && ext !== '.mp4') {
            return cb(res.send(400).end('only jpg, png and mp4 are allowes'), false);
        }
        cb(null, true);
    }
});

module.exports = storage;