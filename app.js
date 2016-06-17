var express = require('express');
var path = require('path');
// 日志模块
var fs = require('fs');
var FileStreamRotator = require('file-stream-rotator');
var logDirectory = __dirname + '/log';
// 数据库及session相关模块引入
var session = require('express-session');
var settings = require('./settings');
var MongoStore = require('connect-mongo')(session);
var User = require('./models/user.js');
var Post = require('./models/post.js');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var flash = require('connect-flash');


var routes = require('./routes/index');

var app = express();


// 添加flash()方法==================================要点1
app.use(flash());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// 日志模块设置，以目录形式呈现
// ensure log directory exists 
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
// create a rotating write stream 
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: logDirectory + '/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
});
app.use(logger('combined',{stream: accessLogStream}));




// mongodb connect
app.use(session({
  // ==============================================要点2
  resave:false,//添加这行  
  saveUninitialized: true,//添加这行  
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    // db: settings.db,
    // host: settings.host
    // =============================================要点3
    url:'mongodb://localhost/nodeweb'
  })
}));


// view 视图交互，实现不同登录状态下呈现不同内容
// 设置请求头user信息，为index.jade做铺垫
// ==================================================要点4
app.use(function(req,res,next){
  res.locals.user = req.session.user;

  var err = req.flash('error');
  var success = req.flash('success');

  res.locals.error = err.length ? err : null;
  res.locals.success = success.length ? success : null;
   
  next();
});


// 路由输出
app.use('/',routes);


// 允许跨进程端口复用,判断当前模块是否被其它模块调用，不是则启动，是就不启动
if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d in %s mode", app.address().port,
           app.settings.env);
}






// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
