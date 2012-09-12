
/*
 * GET home page.
 */

var model = require('../model');

var User = model.User,
    Presentation = model.Presentation,
    Administrator = model.Administrator;

exports.index = function (req, res) {
  console.log('Express session\'s admin_id:', req.session.admin_id);  // For debug
  // render admin  if login
  if (req.session.admin_id) {
    // Find admin user
    Administrator.findByUserId(req.session.admin_id, function (err, items) {
      res.redirect('/admin/user');
    });
  } else {
    // else, render login page
    res.render('admin/login', { title: 'admin' });
  }
};

exports.login = function (req, res) {
  // Check login
  Administrator.findByUserId(req.body.user_id, function (err, administrator) {
    if (administrator) {
      if (administrator.authenticate(req.body.password)) {
        // Save admin id to session
        req.session.admin_id = req.body.user_id;
        res.redirect('/admin/user');
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
  User.find({}, function (err, items) {
    if (err) {
      console.log(err);
      res.render('admin/login');
    } else {
      res.render('admin/user', {
        title: 'admin page(user)',
        users: items
      });
    }
  });
};

exports.presentation = function (req, res) {
  Presentation.find({}, function (err, items){
    if(err){
      console.log(err);
      res.render('admin/login');
    }else{
      res.render('admin/presentation', {
        title: 'admin page(presentation)',
        presentations: items
      });
    }
  });
};

/* Create Administrator(normally comment-out) */
exports.new = function (req, res) {
  res.render('admin/new', { title: 'Sign up' });
};

exports.create = function (req, res) {
  var newAdministrator = new Administrator(req.body);
  newAdministrator.save(function (err) {
    if (err) {
      console.log(err);
      res.redirect('back');
    } else {
      res.redirect('/admin');
    }
  });
};
/*end of create Administrator*/

// TODO: logout is needed to change remove of session document
exports.logout = function (req, res) {
  // Destroy session
  // req.session.destroy();
  delete req.session.admin_id;
  res.redirect('/admin');
};
