
/**
 * Module dependencies.
 */

var express = require('express'),
    socketio = require('socket.io'),
    routes = require('./routes/main'),
    http = require('http'),
    path = require('path');
    // FIXME: Error: Cannot find module 'connect'
    // connect = require('connect');

var app = express(),
    server = http.createServer(app),
    io = socketio.listen(server);

var MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore();

// TODO: Any library?
var parseCookie = function (cookie) {
  var cookies = {};
  cookie && cookie.split(';').forEach(function (c) {
    var parts = c.split('=');
    cookies[parts[0].trim()] = (parts[ 1 ] || '').trim();
  });
  return cookies;
};


app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: "hogehoge"
  , store: sessionStore
  }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});


app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/', routes.login);
app.get('/newUser', routes.newUser);
app.post('/createUser', routes.createUser);
app.get('/newPresentation', routes.newPresentation);
app.post('/createPresentation', routes.createPresentation);
app.get('/presentationTest', routes.presentationTest);
app.get('/statistics', routes.statistics);
app.get('/logout', routes.logout);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// TODO: Use session storage
// Configuration
io.configure(function () {
  io.set('authorization', function (handshakeData, callback) {
    if (handshakeData.headers.cookie) {
      // Get cookie from handshakeData
      var cookie = handshakeData.headers.cookie;
      // Get express.sid from cookie
      var sessionID = parseCookie(cookie)['connect.sid'];
      handshakeData.sessionID = sessionID;
      // Authorized OK
      callback(null, true);
      // Get session from storage
      /*
      sessionStore.get(sessionID, function (err, session) {
        if (err) {
          callback(err.message, false);
        } else {
          // Save session data
          handshakeData.session = session;
          // Authorized OK
          callback(null, true);
        }
      });
      */
    } else {
      return callback('Cannot find cookie', false);
    }
  });
});

// TODO: Optimize
var userData = {},
    count = {
      presenter: []
    , listener : []
    };

var presentation = io
  .of('/presentation')
  .on('connection', function (socket) {
    var sessionID = socket.id;
    console.log('Connect:', sessionID);  // For debug
    // io.of('/statistics').emit('statistics', count);
    console.log(count);

    socket.on('page', function (data) {
      socket.broadcast.emit('page', data);
    });

    socket.on('location', function (data) {
      presentation.emit('location', data);
    });

    socket.on('clear', function (data) {
      presentation.emit('clear', data);
    });

    socket.on('count', function (data) {
      var arr = count[data.userType];
      if (arr[data.pageNum] == null) {
        arr[data.pageNum] = 0;
      }
      switch (data.action) {
        case 'count':
          arr[data.pageNum]++;
          // io.of('/statistics').emit('statistics', count);
          console.log(count);
          break;
        case 'discount':
          arr[data.pageNum]--;
          break;
      }
      userData[sessionID] = {
        userType: data.userType
      , pageNum : data.pageNum
      };
      console.log(data.action, userData);  // For debug
    });

    socket.on('reset', function () {
      console.log('Reset');  // For debug
      count = {
        presenter: []
      , listener : []
      };
      for (var key in userData) {
        delete userData[key];
      }
      presentation.emit('reset');
    });

    socket.on('disconnect', function () {
      console.log('Disconnect:', sessionID);  // For debug
      var data, arr;
      // If not after 'reset'
      if (userData[sessionID]) {
        data = userData[sessionID];
        arr = count[data.userType];
        if (arr[data.pageNum]) {
          arr[data.pageNum]--;
          console.log('discount', userData);  // For debug
        }
        delete userData[sessionID];
      }
      // io.of('/statistics').emit('statistics', count);
      console.log(count);
    });

var statistics = io
  .of('/statistics')
  .on('connection', function (socket) {
    var _SHOW_COUNT_INTERVAL = 3000;

    // Show count when statistics page is loaded
    socket.emit('statistics', count);

    // Show count at regular intervals
    var showCountTimerId = setInterval(function () {
      socket.emit('statistics', count);
    }, _SHOW_COUNT_INTERVAL);

    socket.on('disconnect', function () {
      clearInterval(showCountTimerId);
    });
  });
});
