
/*
 * GET home page.
 */

var model = require('../model');

var User = model.User,
    Presentation = model.Presentation;

exports.index = function (req, res) {
  console.log('Express session\'s user_id:', req.session.user_id);  // For debug
  // ログイン済みユーザはlistを表示
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
    // ログイン済みでなければトップページを表示
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

exports.newUser = function (req, res) {
  res.render('newUser', { title: 'Sign up' });
};

exports.createUser = function (req, res) {
  var newUser = new User(req.body);
  newUser.save(function (err) {
    if (err) {
      console.log(err);
      res.redirect('back');
    } else {
      req.session.user_id = req.body.user_id;
      res.redirect('/');
    }
  });
};

// TODO: deleteUser

exports.newPresentation = function (req, res) {
  res.render('newPresentation', { title: 'Upload your presentation' });
};

exports.createPresentation = function (req, res) {
  // Get user id from session
  req.body.user_id = req.session.user_id;
  // Create presentaion
  var newPresentation = new Presentation(req.body);
  newPresentation.save(function (err) {
    if (err) {
      console.log(err);
      res.redirect('back');
    } else {
      res.redirect('/');
    }
  });
};

// TODO: deletePresentation

exports.presentationTest = function (req, res) {
  var user_type;
  // presenter or listener
  user_type = (req.session.user_id) ? 'presenter' : 'listener';
  res.render('presentationTest', { title: 'Share Presentation Test', user_type: user_type });
};

exports.statistics = function (req, res) {
  res.render('statistics', { title: 'Statistics' });
};

exports.logout = function (req, res) {
  // Destroy session
  req.session.destroy();
  res.redirect('/');
};
