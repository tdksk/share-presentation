'use strict';
/**
 * Server
 */
var io = require('./app').io;

// TODO: Optimize
var _userData = {},
    _pageCount = {},
    _reactionCount = {};

var presentation = io
  .of('/presentation')
  .on('connection', function (socket) {
    socket.on('init', function (req) {
      var room = req.user_id + '/' + req.presentation_id;
      socket.set('room', room);
      socket.join(room);
      console.log('Join:', room);  // For debug
    });

    var sessionID = socket.id;
    console.log('Presentation connect:', sessionID);  // For debug

    socket.on('page', function (data) {
      var room;
      socket.get('room', function (err, _room) {
        room = _room;
      });
      socket.broadcast.to(room).emit('page', data);
      console.log('Page:', data);  // For debug
    });

    socket.on('sync page', function (data) {
      var room;
      socket.get('room', function (err, _room) {
        room = _room;
      });
      var arr,
          presenterIndex;
      arr = _pageCount[room].presenter;
      presenterIndex = arr.indexOf(Math.max.apply(null, arr));
      if (data !== presenterIndex) {
        socket.to(room).emit('sync page', presenterIndex);
        console.log('Sync page:', presenterIndex);  // For debug
      }
    });

    socket.on('location', function (data) {
      var room;
      socket.get('room', function (err, _room) {
        room = _room;
      });
      presentation.to(room).emit('location', data);
    });

    socket.on('clear', function (data) {
      var room;
      socket.get('room', function (err, _room) {
        room = _room;
      });
      presentation.to(room).emit('clear', data);
    });

    socket.on('count', function (data) {
      var room;
      socket.get('room', function (err, _room) {
        room = _room;
      });

      _pageCount[room] = _pageCount[room] || {
        presenter: []
      , listener : []
      };
      var arr = _pageCount[room][data.userType];
      for (var i = 0, length = data.pageNum + 1; i < length; i++) {
        arr[i] = arr[i] || 0;
      }
      // arr[data.pageNum] = arr[data.pageNum] || 0;
      switch (data.action) {
        case 'count':
          arr[data.pageNum]++;
          // io.of('/statistics').emit('statistics', _pageCount[room]);
          presentation.to(room).emit('user count', _pageCount[room]);
          console.log(_pageCount[room]);  // For debug
          break;
        case 'discount':
          arr[data.pageNum]--;
          break;
      }
      _userData[sessionID] = {
        userType: data.userType
      , pageNum : data.pageNum
      };
      console.log(data.action, _userData);  // For debug
    });

    socket.on('reaction', function (data) {
      var room;
      socket.get('room', function (err, _room) {
        room = _room;
      });

      _reactionCount[room] = _reactionCount[room] || {
        good: []
      , bad : []
      };
      var arr = _reactionCount[room][data.type];
      for (var i = 0, length = data.pageNum + 1; i < length; i++) {
        arr[i] = arr[i] || 0;
      }
      // arr[data.pageNum] = arr[data.pageNum] || 0;
      arr[data.pageNum]++;
      presentation.to(room).emit('reaction count', _reactionCount[room]);
      console.log(_reactionCount[room]);  // For debug
    });

    socket.on('get reaction', function () {
      var room;
      socket.get('room', function (err, _room) {
        room = _room;
      });
      presentation.to(room).emit('reaction count', _reactionCount[room]);
    });

    socket.on('reset reaction', function (data) {
      var room;
      socket.get('room', function (err, _room) {
        room = _room;
      });
      _reactionCount[room] = {
        good: []
      , bad : []
      };
      presentation.to(room).emit('reaction count', _reactionCount[room]);
    });

    socket.on('reset', function () {
      var room;
      socket.get('room', function (err, _room) {
        room = _room;
      });
      console.log('Reset');  // For debug
      _pageCount[room] = {
        presenter: []
      , listener : []
      };
      _reactionCount[room] = {
        good: []
      , bad : []
      };
      for (var key in _userData) {
        delete _userData[key];
      }
      presentation.to(room).emit('reset');
    });

    socket.on('disconnect', function () {
      var room;
      socket.get('room', function (err, _room) {
        room = _room;
      });
      console.log('Presentation disconnect:', sessionID);  // For debug
      var data, arr;
      // If not after 'reset'
      if (_userData[sessionID]) {
        data = _userData[sessionID];
        arr = _pageCount[room][data.userType];
        if (arr[data.pageNum]) {
          arr[data.pageNum]--;
          console.log('discount', _userData);  // For debug
        }
        delete _userData[sessionID];
      }
      // io.of('/statistics').emit('statistics', _pageCount[room]);
      socket.leave(room);
      presentation.to(room).emit('user count', _pageCount[room]);
      console.log(_pageCount[room]);  // For debug
    });
  });

var statistics = io
  .of('/statistics')
  .on('connection', function (socket) {
    socket.on('init', function (req) {
      var room = req.user_id + '/' + req.presentation_id;
      socket.set('room', room);
      socket.join(room);
    });

    var _SHOW_COUNT_INTERVAL = 3000;

    // Show count at regular intervals
    var showCountTimerId = setInterval(function () {
      var room;
      socket.get('room', function (err, _room) {
        room = _room;
      });
      socket.emit('statistics', _pageCount[room]);
    }, _SHOW_COUNT_INTERVAL);

    socket.on('disconnect', function () {
      var room;
      socket.get('room', function (err, _room) {
        room = _room;
      });
      socket.leave(room);
      clearInterval(showCountTimerId);
    });
  });
