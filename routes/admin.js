'use strict';
/*
 * GET home page.
 */

var model = require('../model');

var User = model.User,
    Presentation = model.Presentation,
    Admin = model.Admin;

exports.index = function (req, res) {
  // Get admin id from session
  var admin_id = req.session.admin_id;
  // Render dashboard if login
  if (admin_id) {
    // Find all users
    User.find({}, function (err, items) {
      if (err) {
        console.log(err);
        res.render('back');
      } else {
        res.render('admin/dashboard', {
          title: 'Admin'
        , admin_id: admin_id
        , users: items
        });
      }
    });
  } else {
    // else, render login page
    res.render('admin/login', { title: 'Admin' });
  }
};

exports.login = function (req, res) {
  var admin_id = req.body.user_id;
  // Check login
  Admin.findByUserId(admin_id, function (err, admin) {
    if (admin) {
      if (admin.authenticate(req.body.password)) {
        // Save admin id to session
        req.session.admin_id = admin_id;
        res.redirect('/admin');
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

exports.user = function (req, res) {
  var user_id;
  // Get user id
  user_id = req.params.uid;
  // Find user's presentations
  Presentation.findByUserId(user_id, function (err, items) {
    if (err) {
      console.log(err);
      res.render('back');
    } else {
      res.render('admin/user', {
        title: user_id
      , presentations: items
      , user_id: user_id
      });
    }
  });
};

/* Create Admin (normally comment-out) */
exports.new = function (req, res) {
  res.render('admin/new', { title: 'Sign up' });
};

exports.create = function (req, res) {
  var admin_id = req.body.user_id;
  var newAdmin = new Admin(req.body);
  newAdmin.save(function (err) {
    if (err) {
      console.log(err);
      res.redirect('back');
    } else {
      req.session.admin_id = admin_id;
      res.redirect('/admin');
    }
  });
};
/* end of create Admin */

exports.logout = function (req, res) {
  // Destroy session
  // req.session.destroy();
  delete req.session.admin_id;
  res.redirect('/admin');
};
