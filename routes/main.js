
/*
 * GET home page.
 */

var model = require('../model');
var User = model.User;
var Presentation = model.Presentation;
var cookies = {};

var _COOKIES_EXPIRES = 60 * 60 * 24;  // cookieの有効期限 (24時間)

exports.index = function (req, res) {
  // LoginUserは('/')でlistへリダイレクト
  if (cookies.id) {
    Presentation.find({ user_id: cookies.id}, function (err, items) {
      if (items) {
        res.render('list', { title: 'Presentation\'s list', items: items });
      } else {
        console.log(err);
        res.redirect('back');
      }
    });
  } else {
    res.render('index', { title: 'Share Presentation' });
  }
};

exports.list = function (req, res) {
  Presentation.find({ user_id: req.body.user_id }, function (err, items) {
    if (items) {
      // cookie発行&保持
      res.cookie('id', req.body.user_id, { expires: new Date(Date.now() + _COOKIES_EXPIRES), httpOnly: true });
      req.headers.cookie && req.headers.cookie.split(';').forEach(function(cookie) {
        var parts = cookie.split('=');
        cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
      });
      cookies.id = req.body.user_id;
      res.render('list', { title: 'Presentation\'s list', items: items });
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
  res.render('presentationTest', { title: 'Share Presentation Test' });
};
