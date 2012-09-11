
/*
 * GET home page.
 */

var model = require('../model');

var User = model.User,
    Presentation = model.Presentation,
    Administrator = model.Administrator;

exports.user = require('./user/user');
exports.presentation = require('./presentation/presentation');
exports.admin = require('./admin/admin');

exports.presentationTest = function (req, res) {
  var user_type;
  // presenter or listener
  user_type = (req.session.user_id) ? 'presenter' : 'listener';
  res.render('presentationTest', { title: 'Share Presentation Test', user_type: user_type });
};

exports.statistics = function (req, res) {
  res.render('statistics', { title: 'Statistics' });
};

//TODO logout is needed to change remove of session document
exports.logout = function (req, res) {
  // Destroy session
  req.session.destroy();
  res.redirect('/user/');
};
