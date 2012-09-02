
/*
 * GET home page.
 */

var model = require('../model');
var User = model.User;

exports.index = function(req, res){
  res.render('index', { title: 'Share Canvas' });
};

exports.canvas = function (req, res) {
  User.findOne({ user_id: req.body.user_id, password: req.body.password }, function (err, item) {
    if (item) {
      res.render('canvas', { title: 'Share Canvas', item: item });
    } else {
      console.log(err);
      res.redirect('back');
    }
  });
};

exports.signup = function (req, res) {
  res.render('signup', { title: 'Sign up' });
};

exports.create = function (req, res) {
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

exports.presentationTest = function(req, res){
  res.render('presentationTest', { title: 'Share Presentation Test' });
};
