'use strict';
/**
 * Models
 */
var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    hash = require('mongoose-hashed-password');

// TODO: Change DB name
var db = mongoose.connect('mongodb://localhost/project3');

var _MIN_PASSWORD_LENGTH = 4,
    _STYLE_DEFAULT = 'default';

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
, created_at: { type: Date, default: Date.now }
, modified_at: { type: Date, default: null }
});

User.pre('save', function (next) {
  this.modified_at = new Date();
  next();
});

User.defineHashedPassword('sha256', validatePassword);

User.statics.findByUserId = function (user_id, callback) {
  this.findOne({ user_id: user_id }, callback);
};

User.statics.deleteByUserId = function (user_id, callback) {
  this.remove({ user_id: user_id }, callback);
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
  , validate: [validatePresenceOf, 'Empty Error']
  }
, user_id: { type: String, required: true, validate: [validatePresenceOf, 'Empty Error'] }
, data: { type: String }
, style: { type: String, default: _STYLE_DEFAULT }
, created_at: { type: Date, default: Date.now }
, modified_at: { type: Date, default: null }
});

Presentation.pre('save', function (next) {
  this.modified_at = new Date();
  next();
});

Presentation.statics.findByUserId = function (user_id, callback) {
  this.find({ user_id: user_id }).sort('-modified_at').exec(callback);
};

Presentation.statics.findByUserIdAndPresentationId = function (user_id, presentation_id, callback) {
  this.findOne({
    user_id: user_id
  , presentation_id: presentation_id
  }, callback);
};

Presentation.statics.deleteByUserIdAndPresentationId = function (user_id, presentation_id, callback) {
  this.remove({
    user_id: user_id
  , presentation_id: presentation_id
  }, callback);
};

/**
 * Amiministrator model
 */
var Admin = User.extend();

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
exports.Admin = db.model('Admin', Admin);
