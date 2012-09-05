
/*
 * GET home page.
 */

var model = require('../model');
var User = model.User;
var Presentation = model.Presentation;

var _COOKIES_EXPIRES = 60 * 60 * 24;  // cookieの有効期限 (24時間)

exports.index = function (req, res) {
  // ログイン済みユーザは('/')でlistへリダイレクト
  var cookies = {};
  req.headers.cookie && req.headers.cookie.split(';').forEach(function(cookie) {
    var parts = cookie.split('=');
    cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
  });
  if (cookies.id) {
    // Find user's presentations
    Presentation.find({ user_id: cookies.id }, function (err, items) {
      res.render('list', {
        title: 'Presentation\'s list'
      , presentations: items
      , user_id: cookies.id
      });
    });
  } else {
    res.render('index', { title: 'Share Presentation' });
  }
};

exports.list = function (req, res) {
  // Check login
  User.findOne({ user_id: req.body.user_id, password: req.body.password }, function (err, user) {
    if (user) {
      // cookie生成
      res.cookie('id', req.body.user_id, { expires: new Date(Date.now() + _COOKIES_EXPIRES), httpOnly: true });

      // Find user's presentations
      Presentation.find({ user_id: req.body.user_id }, function (err, items) {
        res.render('list', {
          title: 'Presentation\'s list'
        , presentations: items
        , user_id: req.body.user_id
        });
      });
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
      res.redirect('/');
    }
  });
};

exports.newPresentation = function (req, res) {
  res.render('newPresentation', { title: 'Upload your presentation' });
};

exports.createPresentation = function (req, res) {
  var newPresentation = new Presentation(req.body);
  newPresentation.save(function (err) {
    if (err) {
      console.log(err);
      res.redirect('back');
    }else{
      res.redirect('/');
    }
  });
};

exports.presentationTest = function (req, res) {
  var cookies = {},
      user_type;
  // Check cookie
  req.headers.cookie && req.headers.cookie.split(';').forEach(function(cookie) {
    var parts = cookie.split('=');
    cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
  });
  // presenter or listener
  user_type = cookies.id ? 'presenter' : 'listener';
  res.render('presentationTest', { title: 'Share Presentation Test', user_type: user_type });
};

exports.statistics = function (req, res) {
  res.render('statistics', { title: 'Statistics' });
};

exports.logout = function (req, res) {
  res.clearCookie('id');
  // req.session.destroy();
  res.redirect('/');
};
