var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    crypto = require('crypto');

var db = mongoose.connect('mongodb://localhost/project3');

var _MIN_PASSWORD_LENGTH = 4;

/**
 * User model
 */
var User = new mongoose.Schema({
  user_id: {
    type: String
  , required: true
  , index: { unique: true, sparse: true }
  , validate: [validatePresenceOf, 'Empty Error']
  }
, hashed_password: String
, salt: String
, created_at: { type: Date, default: Date.now }
});

User.virtual('password').set(function (pw) {
  this._password = pw;
  this.salt = this.createSalt();
  this.hashed_password = this.encryptPassword(pw);
}).get(function () {
  return this._password;
});

User.methods.authenticate = function (plain) {
  return this.encryptPassword(plain) === this.hashed_password;
};

User.methods.createSalt = function () {
  return Math.round(new Date().valueOf() * Math.random()) + '';
};

User.methods.encryptPassword = function (str) {
  return crypto.createHmac('sha1', this.salt).update(str).digest('hex');
};

User.statics.findByUserId = function (user_id, callback) {
  this.findOne({ user_id: user_id }, callback);
};

User.pre('save', function (next) {
  if (!validatePassword(this.password)) return next(new Error('Invalid password'));
  next();
});

// TODO: LoginToken model

/**
 * Presentation model
 */
var Presentation = new mongoose.Schema({
  presentation_id: {
    type: String
  , required: true
  , index: { unique: true, sparse: true }
  , validate: [validatePresenceOf, 'Empty Error']
  }
, user_id: { type: String, required: true, validate: [validatePresenceOf, 'Empty Error'] }
, created_at: { type: Date, default: Date.now }
});

Presentation.statics.findByUserId = function (user_id, callback) {
  this.find({ user_id: user_id }, callback);
};

/**
 * Amiministrator model
 */
 //var Admin = User


/**
 * Utilities
 */
function validatePresenceOf(value) {
  return value && value.length;
}

// TODO: More strict validation
function validatePassword(value) {
  return value && value.length >= _MIN_PASSWORD_LENGTH;
}

/**
 * Export
 */
exports.User = db.model('User', User);
exports.Presentation = db.model('Presentation', Presentation);
