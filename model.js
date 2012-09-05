var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/project3');

/**
 * User model
 */
// TODO: パスワードのハッシュ化 (sha1)
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

User.statics.findByUserIdAndPassword = function (user_id, password, callback) {
  this.findOne({ user_id: user_id, password: password }, callback);
};

// TODO: LoginToken model

/**
 * Presentation model
 */
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

Presentation.statics.findByUserId = function (user_id, callback) {
  this.find({ user_id: user_id }, callback);
};

/**
 * Utilities
 */
function validator(v) {
  return v.length > 0;
}

/**
 * Export
 */
exports.User = db.model('User', User);
exports.Presentation = db.model('Presentation', Presentation);
