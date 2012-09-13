'use strict';
/*
 * GET home page.
 */

var model = require('../model');

var User = model.User,
    Presentation = model.Presentation;

exports.index = function (req, res) {
  // Get user id from session
  var user_id = req.session.user_id;
  // Render dashboard if login
  if (user_id) {
    // Find user's presentations
    Presentation.findByUserId(user_id, function (err, items) {
      if (err) {
        console.log(err);
        res.render('back');
      } else {
        res.render('user/dashboard', {
          title: 'Dashboard'
        , presentations: items
        , user_id: user_id
        });
      }
    });
  } else {
    // else, render login page
    res.render('user/login', { title: 'Share Presentation' });
  }
};

exports.login = function (req, res) {
  var user_id = req.body.user_id;
  // Check login
  User.findByUserId(user_id, function (err, user) {
    if (user) {
      if (user.authenticate(req.body.password)) {
        // Save user id to session
        req.session.user_id = user_id;
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

exports.new = function (req, res) {
  res.render('user/new', { title: 'Sign up' });
};

exports.create = function (req, res) {
  var user_id = req.body.user_id;
  var newUser = new User(req.body);
  newUser.save(function (err) {
    if (err) {
      console.log(err);
      res.redirect('back');
    } else {
      req.session.user_id = user_id;
      res.redirect('/');
    }
  });
};

exports.delete = function (req, res) {
  var user_id;
  // Get user id
  user_id = req.body.user_id;
  // Delete user
  User.deleteByUserId(user_id, function (err) {
    if (err) {
      console.log(err);
      res.redirect('back');
    } else {
      console.log('Delete success:', user_id);
      res.redirect('back');
    }
  });
};

exports.logout = function (req, res) {
  // Destroy session
  req.session.destroy();
  res.redirect('/');
};
