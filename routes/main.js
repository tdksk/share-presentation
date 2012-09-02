
/*
 * GET home page.
 */

var model = require('../model');
var User = model.User;
var Presentation = model.Presentation;

exports.index = function(req, res){
  res.render('index', { title: 'project3' });
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

exports.list = function(req, res){
  Presentation.find({ user_id: req.body.user_id }, function (err, items) {
    if (items) {
      res.render('list', { title: 'Presentation\'s list', items: items });
    } else {
      console.log(err);
      res.redirect('back');
    }
  });
};

