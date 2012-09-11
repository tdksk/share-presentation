
/*
 * GET home page.
 */

var model = require('../../model');

var User = model.User,
    Presentation = model.Presentation;

exports.new = function (req, res) {
  res.render('presentation/new', { title: 'Upload your presentation' });
};

exports.create = function (req, res) {
  // Get user id from session
  req.body.user_id = req.session.user_id;
  // Create presentaion
  var newPresentation = new Presentation(req.body);
  newPresentation.save(function (err) {
    if (err) {
      console.log(err);
      res.redirect('back');
    } else {
      res.redirect('/user/');
    }
  });
};

exports.delete = function (req, res){
  Presentation.remove({ user_id: req.body.user_id, presentation_id: req.body.presentation_id }, function (err){
      if(err){
	  console.log(err);
	  res.render('admin/index');
      }else{
	  console.log('delete success', req.body.presentation_id);
	  res.render('admin/presentation');
      }
  });
};


//TODO logout is needed to change remove of session document
exports.logout = function (req, res) {
  // Destroy session
  req.session.destroy();
  res.redirect('/user/');
};
