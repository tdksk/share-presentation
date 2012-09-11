
/*
 * GET home page.
 */

var model = require('../../model');

var Presentation = model.Presentation;

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
      res.redirect('/');
    }
  });
};

exports.delete = function (req, res) {
  Presentation.remove({ user_id: req.body.user_id, presentation_id: req.body.presentation_id }, function (err) {
    if (err) {
      console.log(err);
      res.render('admin/index');
    } else {
      console.log('delete success', req.body.presentation_id);
      res.render('admin/presentation');
    }
  });
};

exports.show = function (req, res) {
  var user_id,
      presentation_id,
      user_type;
  // Get user_id and presentation_id
  user_id = req.params.uid;
  presentation_id = req.params.pid;
  // presenter or listener
  user_type = (req.session.user_id) ? 'presenter' : 'listener';
  res.render('presentation/show', {
    title: presentation_id,
    user_type: user_type,
    user_id : user_id,
    presentation_id : presentation_id
  });
};

exports.edit = function (req, res) {
  var user_id,
      presentation_id;
  // Get user_id and presentation_id
  user_id = req.params.uid;
  presentation_id = req.params.pid;
  res.render('presentation/edit', {
    title: 'Edit',
    user_id : user_id,
    presentation_id : presentation_id
  });
};

exports.stat = function (req, res) {
  res.render('presentation/stat', { title: 'Statistics' });
};
