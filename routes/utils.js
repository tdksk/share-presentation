'use strict';
var fs = require('fs');

var _PUBLIC_DIR = './public';

exports.write = function (req, res) {
  var filePath = _PUBLIC_DIR + req.body.filePath;
  fs.writeFile(filePath, req.body.contents);
  console.log('Write to \'' + filePath + '\'');  // For debug
  res.redirect('back');
};
