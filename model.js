var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/project3');

function validator(v) {
  return v.length > 0;
}

var User = new mongoose.Schema({
  user_id: {
    type: String
  , required: true
  , index: { unique: true, sparse: true }
  , validate: [validator, 'Empty Error']
  }
, password: { type: String, required: true, validate: [validator, 'Empty Error'] }
, created_at: { type: Date, default: Date.now }
});


var Presentation = new mongoose.Schema({
  presentation_id: {
    type: String
  , required: true
  , index: { unique: true, sparse: true }
  , validate: [validator, 'Empty Error']
  }
, user_id: { type: String, required: true, validate: [validator, 'Empty Error'] }
, created_at: { type: Date, default: Date.now }
});

exports.User = db.model('User', User);
exports.Presentation = db.model('Presentation', Presentation);
