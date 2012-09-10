
/**
 * Module dependencies.
 */

var express = require('express'),
    socketio = require('socket.io'),
    routes = require('./routes/main'),
    http = require('http'),
    path = require('path'),
    connect = require('connect');

var app = express(),
    server = http.createServer(app),
    io = socketio.listen(server);

var MongoStore = require('connect-mongodb'),
    sessionStore = new MongoStore({ url: 'mongodb://localhost/project3' }),
    Session = connect.middleware.session.Session;

// Override cookie.parse
var parseCookie = function (cookies) {
  var obj = require('cookie').parse(cookies);
  for (var key in obj) {
    obj[key] = obj[key].split(":")[1].split(".")[0];
  }
  return obj;
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
  , cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }  // 1 week
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
app.post('/deleteUser', routes.deleteUser);
app.get('/newPresentation', routes.newPresentation);
app.post('/createPresentation', routes.createPresentation);
app.post('/deletePresentation', routes.deletePresentation);
app.get('/presentationTest', routes.presentationTest);
app.get('/statistics', routes.statistics);
app.get('/logout', routes.logout);
app.get('/admin', routes.adminUser);
app.get('/admin_Presentation', routes.adminPresentation);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// Socket.IO Configuration
io.configure(function () {
  io.set('authorization', function (handshakeData, callback) {
    if (handshakeData.headers.cookie) {
      // Get cookie from handshakeData
      var cookie = handshakeData.headers.cookie;
      // Get express.sid from cookie
      var sessionID = parseCookie(cookie)['connect.sid'];
      handshakeData.sessionID = sessionID;
      
      // Get session from storage
      sessionStore.get(sessionID, function (err, session) {
        if (err) {
          callback(err.message, false);
        } else {
          // Save session data
          handshakeData.session = new Session(handshakeData, session);
          // Authorized OK
          callback(null, true);
        }
      });
   } else {
      return callback('Cannot find cookie', false);
    }
  });
});

// TODO: Optimize
var _userData = {},
    _pageCount = {
      presenter: []
    , listener : []
    },
    _reactionCount = {
      good: []
    , bad : []
    };

var presentation = io
  .of('/presentation')
  .on('connection', function (socket) {
    var sessionID = socket.id;
    console.log('Connect:', sessionID);  // For debug
    // io.of('/statistics').emit('statistics', _pageCount);
    console.log(_pageCount);

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
      var arr = _pageCount[data.userType];
      arr[data.pageNum] = arr[data.pageNum] || 0;
      switch (data.action) {
        case 'count':
          arr[data.pageNum]++;
          // io.of('/statistics').emit('statistics', _pageCount);
          console.log(_pageCount);
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
      var arr = _reactionCount[data.type];
      arr[data.pageNum] = arr[data.pageNum] || 0;
      arr[data.pageNum]++;
      presentation.emit('reaction count', _reactionCount);
      console.log(_reactionCount);  // For debug
    });

    socket.on('get reaction', function () {
      presentation.emit('reaction count', _reactionCount);
    });

    socket.on('reset reaction', function (data) {
      _reactionCount = {
        good: []
      , bad : []
      };
      presentation.emit('reaction count', _reactionCount);
    });

    socket.on('reset', function () {
      console.log('Reset');  // For debug
      _pageCount = {
        presenter: []
      , listener : []
      };
      _reactionCount = {
        good: []
      , bad : []
      };
      for (var key in _userData) {
        delete _userData[key];
      }
      presentation.emit('reset');
    });

    socket.on('disconnect', function () {
      console.log('Disconnect:', sessionID);  // For debug
      var data, arr;
      // If not after 'reset'
      if (_userData[sessionID]) {
        data = _userData[sessionID];
        arr = _pageCount[data.userType];
        if (arr[data.pageNum]) {
          arr[data.pageNum]--;
          console.log('discount', _userData);  // For debug
        }
        delete _userData[sessionID];
      }
      // io.of('/statistics').emit('statistics', _pageCount);
      console.log(_pageCount);
    });

var statistics = io
  .of('/statistics')
  .on('connection', function (socket) {
    var _SHOW_COUNT_INTERVAL = 3000;

    // Show count when statistics page is loaded
    socket.emit('statistics', _pageCount);

    // Show count at regular intervals
    var showCountTimerId = setInterval(function () {
      socket.emit('statistics', _pageCount);
    }, _SHOW_COUNT_INTERVAL);

    socket.on('disconnect', function () {
      clearInterval(showCountTimerId);
    });
  });
});
