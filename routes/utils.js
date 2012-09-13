'use strict';
var fs = require('fs'),
    path = require('path');

var _PUBLIC_DIR = './public',
    _PRESENTATION_DIR = '/data';

exports.write = function (req, res) {
  var user_dir,
      filePath;

  // Check user directory
  user_dir = path.join(_PUBLIC_DIR + _PRESENTATION_DIR, req.body.user_id);
  path.exists(user_dir, function (exists) {
    if (!exists) {
      fs.mkdirSync(user_dir);
      console.log('Directory created:', user_dir);
      write();
    } else {
      write();
    }
  });

  // Write file
  var write = function () {
    filePath = _PUBLIC_DIR + req.body.filePath;
    fs.writeFile(filePath, req.body.contents);
    console.log('Write to \'' + filePath + '\'');  // For debug
    res.redirect('back');
  };
};
