
/*
 * GET home page.
 */

var model = require('../../model');

var User = model.User,
    Presentation = model.Presentation;


exports.index = function (req, res) {
  console.log('Express session\'s user_id:', req.session.user_id);  // For debug
  // render list if login
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
    // else, render login page
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
        res.redirect('/user/');
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
  var newUser = new User(req.body);
  newUser.save(function (err) {
    if (err) {
      console.log(err);
      res.redirect('back');
    } else {
      req.session.user_id = req.body.user_id;
      res.redirect('/user/');
    }
  });
};

exports.delete = function (req, res){
  User.remove({ user_id: req.body.user_id }, function (err){
      if(err){
	  console.log(err);
	  res.render('index');
      }else{
	  console.log('delete success', req.body.user_id);
	  res.render('index');
      }
  });
};

//TODO logout is needed to change remove of session document
exports.logout = function (req, res) {
  // Destroy session
  req.session.destroy();
  res.redirect('/user/');
};
