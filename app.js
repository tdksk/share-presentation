
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
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/canvas', routes.canvas);
app.get('/newuser', routes.newuser);
app.post('/createuser', routes.createuser);
app.get('/newpresentation', routes.newpresentation);
app.post('/createpresentation', routes.createpresentation);
app.post('/list', routes.list);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on('connection', function (socket) {
  socket.on('location', function (data) {
    io.sockets.emit('location', data);
  });
  socket.on('clear', function (data) {
    io.sockets.emit('clear', data);
  });
});
