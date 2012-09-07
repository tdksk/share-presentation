
/*
 * GET home page.
 */

var model = require('../model');

var User = model.User,
    Presentation = model.Presentation;

var _COOKIES_EXPIRES = 60 * 60 * 24;  // cookieの有効期限 (24時間)

// TODO: Modify authorization

exports.index = function (req, res) {
  // ログイン済みユーザはlistを表示
  var cookies = {};
  req.headers.cookie && req.headers.cookie.split(';').forEach(function (cookie) {
    var parts = cookie.split('=');
    cookies[parts[0].trim()] = (parts[1] || '').trim();
  });
  // console.log(cookies);  // For debug
  if (cookies.user_id) {
    // Find user's presentations
    Presentation.findByUserId(cookies.user_id, function (err, items) {
      res.render('list', {
        title: 'Presentation\'s list'
      , presentations: items
      , user_id: cookies.user_id
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
        // cookie生成
        res.cookie('user_id', req.body.user_id, { expires: new Date(Date.now() + _COOKIES_EXPIRES), httpOnly: true });
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
      // cookie生成
      res.cookie('user_id', req.body.user_id, { expires: new Date(Date.now() + _COOKIES_EXPIRES), httpOnly: true });
      res.redirect('/');
    }
  });
};

// TODO: deleteUser

exports.newPresentation = function (req, res) {
  res.render('newPresentation', { title: 'Upload your presentation' });
};

exports.createPresentation = function (req, res) {
  var cookies = {};
  // Check cookie
  req.headers.cookie && req.headers.cookie.split(';').forEach(function (cookie) {
    var parts = cookie.split('=');
    cookies[parts[0].trim()] = (parts[ 1 ] || '').trim();
  });
  // Get user_id from cookie
  req.body.user_id = cookies.user_id;
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
  var cookies = {},
      user_type;
  // Check cookie
  req.headers.cookie && req.headers.cookie.split(';').forEach(function (cookie) {
    var parts = cookie.split('=');
    cookies[parts[0].trim()] = (parts[ 1 ] || '').trim();
  });
  // presenter or listener
  user_type = (cookies.user_id) ? 'presenter' : 'listener';
  res.render('presentationTest', { title: 'Share Presentation Test', user_type: user_type });
};

exports.statistics = function (req, res) {
  res.render('statistics', { title: 'Statistics' });
};

exports.logout = function (req, res) {
  res.clearCookie('user_id');
  req.session.destroy();
  res.redirect('/');
};
