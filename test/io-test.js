'use strict';
/**
 * Socket.IO test
 */
var should = require('should'),
    client = require('socket.io-client');

var socketUrl = 'http://localhost:8080',
    options = {
      transports: ['websocket']
    , 'force new connection': true
    };

describe('Presentation connection', function () {
  it('1000人接続して count と reaction を emit', function (done) {
    this.timeout(10000);
    var count = 0;
    var checkCount = function () {
      count++;
      if (count === 1000) done();
    };

    for (var i = 0; i < 1000; i++) {
      var socket = client.connect(socketUrl, options).of('/presentation');
      socket.on('connect', function () {
        // Room を初期化
        socket.emit('init', {
          user_id: 'hoge'
        , presentation_id: 'chikazawa'
        });
        // count を送信
        socket.emit('count', {
          pageNum: 3
        , userType: 'listener'
        , action: 'count'
        });
        // reaction を送信
        socket.emit('reaction', {
          pageNum: 3
        , type: 'good'
        });
        checkCount();
      });
    }
  });
  it('location を1000人に送る', function (done) {
    this.timeout(10000);
    var socket1 = client.connect(socketUrl, options).of('/presentation');
    socket1.on('connect', function () {
      // Room を初期化
      socket1.emit('init', {
        user_id: 'hoge'
      , presentation_id: 'huga'
      });
      // page を送る
      socket1.emit('location', {
        pageNum: 3
      , _x: 100
      , _y: 200
      });
    });
    setTimeout(function () {
      done();
    }, 3000);
  });
  it('page を1000人に送る', function (done) {
    this.timeout(10000);
    var socket1 = client.connect(socketUrl, options).of('/presentation');
    socket1.on('connect', function () {
      // Room を初期化
      socket1.emit('init', {
        user_id: 'hoge'
      , presentation_id: 'huga'
      });
      // page を送る
      socket1.emit('page', {
        pageNum: 3
      , action: 'next'
      });
    });
    setTimeout(function () {
      done();
    }, 3000);
  });
});
