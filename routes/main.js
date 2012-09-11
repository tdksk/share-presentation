
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

exports.index = function (req, res) {
  console.log('Express session\'s user_id:', req.session.user_id);  // For debug
  // render list if login
  if (req.session.user_id) {
    // Find user's presentations
    Presentation.findByUserId(req.session.user_id, function (err, items) {
      res.render('list', {
        title: 'Presentation list'
      , presentations: items
      , user_id: req.session.user_id
      });
    });
  } else {
    // else, render login page
    res.render('index', { title: 'Share Presentation' });
  }
};

exports.login = function (req, res) {
  // Check login
  User.findByUserId(req.body.user_id, function (err, user) {
    if (user) {
      if (user.authenticate(req.body.password)) {
        // Save user id to session
        req.session.user_id = req.body.user_id;
        res.redirect('/');
      } else {
        console.log(err);
        res.redirect('back');
      }
    } else {
      console.log(err);
      res.redirect('back');
    }
  });
};


exports.presentationTest = function (req, res) {;
  var user_id = req.params.uid;
  var presentation_id = req.params.pid;
  var rendering = 'data/' + user_id + '/presentationTest';
  var user_type;
  // presenter or listener
  user_type = (req.session.user_id) ? 'presenter' : 'listener';
  res.render( rendering, { 
      title: 'Share Presentation Test', 
      user_type: user_type,
      user_id : user_id,
      presentation_id : presentation_id
      });
};

exports.statistics = function (req, res) {
  res.render('statistics', { title: 'Statistics' });
};

//TODO logout is needed to change remove of session document
exports.logout = function (req, res) {
  // Destroy session
  req.session.destroy();
  res.redirect('/');
};
