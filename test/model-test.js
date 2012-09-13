'use strict';
/**
 * Model test
 */
var should = require('should');

var model = require('../model');
var User = model.User,
    Presentation = model.Presentation;

describe('User model', function () {
  it('new した時 null でない' ,function () {
    var user = new User({ user_id: 'test', password: 'test' });
    should.exist(user);
  });
  it('与えられた user_id を返す' ,function () {
    var user = new User({ user_id: 'test', password: 'test' });
    user.should.have.property('user_id', 'test');
    user.user_id = 'test2';
    user.should.have.property('user_id', 'test2');
  });
  it('与えられた password を返す' ,function () {
    var user = new User({ user_id: 'test', password: 'test' });
    user.should.have.property('password', 'test');
    user.password = 'test2';
    user.should.have.property('password', 'test2');
  });
  it('hashed_password, salt プロパティを自動生成する' ,function () {
    var user = new User({ user_id: 'test', password: 'test' });
    user.should.have.property('hashed_password');
    user.should.have.property('salt');
  });
  it('#save()' ,function (done) {
    var user = new User({ user_id: 'testhogehuga', password: 'test' });
    user.save(done);
  });
  it('#findByUserId()' ,function (done) {
    User.findByUserId('testhogehuga', function (err, res) {
      if (err) return done(err);
      res.should.have.property('user_id', 'testhogehuga');
      done();
    });
  });
  it('#deleteByUserId()' ,function (done) {
    User.deleteByUserId('testhogehuga', done);
  });
});

describe('Presentation model', function () {
  it('new した時 null でない' ,function () {
    var presentation = new Presentation({ user_id: 'test', presentation_id: 'test' });
    should.exist(presentation);
  });
  it('与えられた user_id を返す' ,function () {
    var presentation = new Presentation({ user_id: 'test', presentation_id: 'test' });
    presentation.should.have.property('user_id', 'test');
    presentation.user_id = 'test2';
    presentation.should.have.property('user_id', 'test2');
  });
  it('与えられた presentation_id を返す' ,function () {
    var presentation = new Presentation({ user_id: 'test', presentation_id: 'test' });
    presentation.should.have.property('presentation_id', 'test');
    presentation.presentation_id = 'test2';
    presentation.should.have.property('presentation_id', 'test2');
  });
  it('#save()' ,function (done) {
    var presentation = new Presentation({ user_id: 'testhogehuga', presentation_id: 'hogehugatest' });
    presentation.save(done);
  });
  it('#findByUserId()' ,function (done) {
    Presentation.findByUserId('testhogehuga', function (err, res) {
      if (err) return done(err);
      for (var user_id in res) {
        res[user_id].should.have.property('user_id', 'testhogehuga');
      }
      done();
    });
  });
  it('#deleteByUserIdAndPresentationId()' ,function (done) {
    Presentation.deleteByUserIdAndPresentationId('testhogehuga', 'hogehugatest', done);
  });
});
