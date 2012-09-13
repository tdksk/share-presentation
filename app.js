'use strict';
/**
 * Module dependencies.
 */

var express = require('express'),
    socketio = require('socket.io'),
    routes = require('./routes/root'),
    http = require('http'),
    path = require('path');

var app = express(),
    server = http.createServer(app),
    io = socketio.listen(server);

var MongoStore = require('connect-mongodb'),
    sessionStore = new MongoStore({ url: 'mongodb://localhost/project3' });


app.configure(function () {
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


app.configure('development', function () {
  app.use(express.errorHandler());
});

/**
 * Routing
 */
// User
app.get('/', routes.user.index);
app.post('/', routes.user.login);
app.get('/user/new', routes.user.new);
app.post('/user/create', routes.user.create);
app.post('/user/delete', routes.user.delete);
app.get('/user/logout', routes.user.logout);
// Presentation
app.get('/presentation/new', routes.presentation.new);
app.post('/presentation/create', routes.presentation.create);
app.post('/presentation/delete', routes.presentation.delete);
app.get('/:uid/:pid/show', routes.presentation.show);
app.get('/:uid/:pid/edit', routes.presentation.edit);
app.get('/:uid/:pid/stat', routes.presentation.stat);
// Admin
app.get('/admin', routes.admin.index);
app.post('/admin', routes.admin.login);
app.get('/admin/new', routes.admin.new);
app.post('/admin/create', routes.admin.create);
app.get('/admin/:uid/detail', routes.admin.user);
app.get('/admin/logout', routes.admin.logout);
// Utils
app.post('/utils/write', routes.utils.write);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/**
 * Socket.IO
 */
exports.io = io;
require('./server');
