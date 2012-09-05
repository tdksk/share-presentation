
/**
 * Module dependencies.
 */

var express = require('express')
  , socketio = require('socket.io')
  , routes = require('./routes/main')
  , http = require('http')
  , path = require('path');

var app = express()
  , server = http.createServer(app)
  , io = socketio.listen(server);


app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  // app.use(express.session({
  //   secret: "keyboard cat"
  //   /*foo: 'val',
  //   secret: 'keyboard cat',
  //   store: new MemoryStore({ reapInterval: 60000 * 10 })*/
  // }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});


app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/newUser', routes.newUser);
app.post('/createUser', routes.createUser);
app.get('/newPresentation', routes.newPresentation);
app.post('/createPresentation', routes.createPresentation);
app.post('/list', routes.list);
app.get('/presentationTest', routes.presentationTest);
app.get('/logout', routes.logout);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var count = []
  , currentIndex
  , isReset;
io.sockets.on('connection', function (socket) {
  io.sockets.emit('showCount', count);
  socket.on('page', function (data) {
    socket.broadcast.emit('page', data);
  });
  socket.on('location', function (data) {
    io.sockets.emit('location', data);
  });
  socket.on('clear', function (data) {
    io.sockets.emit('clear', data);
  });
  socket.on('count', function (data) {
    if (count[data.pageNum] == null) {
      count[data.pageNum] = 0;
    }
    switch (data.action) {
      case 'count':
        count[data.pageNum]++;
        break;
      case 'discount':
        count[data.pageNum]--;
        break;
    }
    io.sockets.emit('showCount', count);
    currentIndex = data.pageNum;
  });
  socket.on('reset', function () {
    count = [];
    isReset = true;
    io.sockets.emit('reset');
  });
  socket.on('disconnect', function () {
    if (!isReset) {
      count[currentIndex]--;
    }
  });
});
