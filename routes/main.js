
/*
 * GET home page.
 */

var model = require('../model');
var User = model.User;
var Presentation = model.Presentation;
var cookies = {};

exports.index = function(req, res){
  //LoginUserは('/')でlistへリダイレクト
  if ( cookies.id ) {
    Presentation.find({ user_id: cookies.id}, function (err, items) {
      if (items){
        res.render('list',{ title: 'Presentation\'s list', items: items });
      }else{
        console.log(err);
        res.redirect('back');
      }
    });
  }else{
    res.render('index', { title: 'project3' });
  }
};

exports.list = function(req, res){
  Presentation.find({ user_id: req.body.user_id }, function (err, items) {
    if (items) {
      //cookie発行＆保持
      res.cookie('id', req.body.user_id, { expires: new Date(Date.now() + 900000), httpOnly: true });
      req.headers.cookie && req.headers.cookie.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
      });
      res.render('list', { title: 'Presentation\'s list', items: items });
    } else {
      console.log(err);
      res.redirect('back');
    }
  });
};

/*exports.canvas = function (req, res) { User.findOne({ user_id: req.body.user_id, password: req.body.password }, function (err, item) {
    if (item) {
      res.render('canvas', { title: 'Share Canvas', item: item });
    } else {
      console.log(err);
      res.redirect('back');
    }
  });
};*/

exports.newuser = function (req, res) {
  res.render('newuser', { title: 'Sign up' });
};

exports.createuser = function (req, res) {
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

exports.newpresentation = function (req, res){
  res.render('newpresentation', { title: 'upload the presentation' });
};

exports.createpresentation = function (req, res){
  var newPresentation = new Presentation(req.body);
  newPresentation.save(function (err) {
    if(err){
      console.log(err);
      res.redirect('back');
    }else{
      res.redirect('back');
    }
  });
};
