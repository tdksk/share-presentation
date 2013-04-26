'use strict';
/*
 * GET home page.
 */

var model = require('../model');

var Presentation = model.Presentation;

var markdown = require('markdown');

exports.create = function (req, res) {
  var user_id,
      presentation_id;
  // Get user id from session
  req.body.user_id = req.session.user_id;
  // Create presentaion
  var newPresentation = new Presentation(req.body);
  user_id = req.body.user_id;
  presentation_id = req.body.presentation_id;
  newPresentation.save(function (err) {
    if (err) {
      console.log(err);
      res.redirect('back');
    } else {
      // Edit page
      res.redirect(user_id + '/' + presentation_id + '/edit');
    }
  });
};

exports.update = function (req, res) {
  var user_id,
      presentation_id,
      presentation_data;
  // Get user id, presentation id, and presentation data
  user_id = req.body.user_id;
  presentation_id = req.body.presentation_id;
  presentation_data = req.body.presentation_data;
  // Update presentation
  Presentation.findByUserIdAndPresentationId(user_id, presentation_id, function (err, presentation) {
    if (err) {
      console.log(err);
    } else {
      presentation.data = presentation_data;
      presentation.save(function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log('Update success:', presentation_id);
          res.redirect('back');
        }
      });
    }
  });
};

exports.delete = function (req, res) {
  var user_id,
      presentation_id;
  // Get user id and presentation id
  user_id = req.body.user_id;
  presentation_id = req.body.presentation_id;
  // Delete presentation
  Presentation.deleteByUserIdAndPresentationId(user_id, presentation_id, function (err) {
    if (err) {
      console.log(err);
      res.redirect('back');
    } else {
      console.log('Delete success:', presentation_id);
      res.redirect('back');
    }
  });
};

exports.view = function (req, res) {
  var user_id,
      presentation_id;
  // Get user id and presentation id
  user_id = req.body.user_id_p;
  presentation_id = req.body.presentation_id_p;
  // Show presentation
  res.redirect(user_id + '/' + presentation_id + '/show');
};

exports.show = function (req, res) {
  var user_id,
      presentation_id,
      presentation_data,
      style,
      user_type;
  // Get user id and presentation id
  user_id = req.params.uid;
  presentation_id = req.params.pid;
  // Find presentation
  Presentation.findByUserIdAndPresentationId(user_id, presentation_id, function (err, presentation) {
    if (err) {
      console.log(err);
      res.redirect('back');
    } else {
      // Get presentation data
      presentation_data = presentation.data;
      // Convert markdown to HTML
      if (presentation_data) {
        presentation_data = markdown.parse(presentation_data);
        presentation_data = htmlToSlide(presentation_data);
      }
      // Get presentation style
      style = presentation.get('style');
      // presenter or listener
      user_type = (user_id === req.session.user_id) ? 'presenter' : 'listener';
      res.render('presentation/show', {
        title: 'Show Presentation'
      , user_type: user_type
      , user_id: user_id
      , presentation_id: presentation_id
      , presentation_data: presentation_data
      , style: style
      });
    }
  });
};

exports.edit = function (req, res) {
  var user_id,
      presentation_id,
      presentation_data;
  // Get user_id and presentation_id
  user_id = req.params.uid;
  presentation_id = req.params.pid;
  if (user_id === req.session.user_id) {
    Presentation.findByUserIdAndPresentationId(user_id, presentation_id, function (err, presentation) {
      if (err) {
        console.log(err);
        res.redirect('back');
      } else {
        // Get presentation data
        presentation_data = presentation.data;
        res.render('presentation/edit', {
          title: 'Edit Presentation'
          , user_id: user_id
          , presentation_id: presentation_id
          , presentation_data: presentation_data
        });
      }
    });
  } else {
    res.redirect('/');
  }
};

exports.stats = function (req, res) {
  var user_id,
      presentation_id;
  // Get user_id and presentation_id
  user_id = req.params.uid;
  presentation_id = req.params.pid;
  res.render('presentation/stats', {
    title: 'Statistics'
  , user_id: user_id
  , presentation_id: presentation_id
  });
};

/**
 * Utilities
 */
function htmlToSlide(data) {
  // Split slides
  data = data.replace(/<h[1-3]>/g, "</section><section>$&");
  // Insert <pre> before <code>
  data = data.replace(/<p><code>/g, '<pre><code>');
  data = data.replace(/<\/code><\/p>/g, '</code></pre>');
  data = data.replace(/<\/section>/, '');
  data += '</section>';
  return data;
};
