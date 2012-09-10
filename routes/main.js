
/*
 * GET home page.
 */

var model = require('../model');

var User = model.User,
    Presentation = model.Presentation,
    Administrator = model.Administrator;

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

exports.deleteUser = function (req, res){
  User.remove({ user_id: req.body.user_id }, function (err){
      if(err){
	  console.log(err);
	  res.render('/');
      }else{
	  console.log('delete success', req.body.user_id);
	  res.render('admin');
      }
  });
};

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
exports.deletePresentation = function (req, res){
  Presentation.remove({ user_id: req.body.user_id, presentation_id: req.body.presentation_id }, function (err){
      if(err){
	  console.log(err);
	  res.render('/');
      }else{
	  console.log('delete success', req.body.presentation_id);
	  res.render('/admin_Presentation');
      }
  });
};

exports.presentationTest = function (req, res) {
  var user_type;
  // presenter or listener
  user_type = (req.session.user_id) ? 'presenter' : 'listener';
  res.render('presentationTest', { title: 'Share Presentation Test', user_type: user_type });
};

exports.statistics = function (req, res) {
  res.render('statistics', { title: 'Statistics' });
};

//admin
exports.loginAdmin = function (req, res) {
  // Check login
  Administrator.findByUserId(req.body.user_id, function (err, user) {
    if (user) {
      if (user.authenticate(req.body.password)) {
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

exports.adminUser = function (req, res) {
    User.find({}, function (err, items){
	if(err){
	    console.log(err);
	    res.render('/');
	}else{
	    res.render('admin', {
		title: 'admin page(user)',
                users: items
	    });
	}
    });
};

exports.adminPresentation = function (req, res) {
    Presentation.find({}, function (err, items){
	if(err){
	    console.log(err);
	    res.render('/');
	}else{
	    res.render('admin_Presentation', {
		title: 'admin page(presentation)',
                presentations: items
	    });
	}
    });
};

/*create Administrator(normally comment-out)*/
exports.newAdministrator = function (req, res) {
  res.render('newAdministrator', { title: 'Sign up' });
};

exports.createAdministrator = function (req, res) {
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

exports.logout = function (req, res) {
  // Destroy session
  req.session.destroy();
  res.redirect('/');
};
