var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require("../models/post.js");

// 定义网站的各项路由，然后输出此模块
/* GET home page. */
router.get('/', function(req, res, next) {
	// 通过Post的get方法中的回调函数获取posts数据
	Post.get(null,function (err,posts) {
		if (err) {
			posts=[];
		}
		res.render('index',{
			title: '首页',
			posts: posts
		})
	})
});



// register
router.get('/reg',checkNotLogin);
router.get('/reg', function(req, res, next) {
  res.render('register', { title: 'register' });
});

router.post('/reg',checkNotLogin);
router.post('/reg',function (req,res) {
  // 测试
  console.log(req.body['password']);
  console.log(req.body['password-repeat']);
  if (req.body['password-repeat'] != req.body['password']) {
    req.flash('error','两次输入密码不一致');
    return res.redirect('/reg');
  }
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  var newUser = new User({
    name: req.body.username,
    password: password
  });

  //检查用户名是否已经存在
  User.get(newUser.name,function (err,user) {
    if (user) {
      err = 'Username already exists.';
    }
    if (err) {
      req.flash('error',err);
      return res.redirect('/reg');
    }
    // 如果不存在则新增用户
    newUser.save(function (err) {
      if (err) {
        req.flash('error',err);
        return res.redirect('/reg');
      }
      req.session.user = newUser;
      req.flash('success','注册成功');
      res.redirect('/');
    });
  });
});


// login
router.get("/login", checkNotLogin);
router.get("/login",function(req,res) {
  res.render("login",{
    title:"用户登录",
  });
});
router.post("/login", checkNotLogin);
router.post("/login",function(req,res) {
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  User.get(req.body.username, function(err, user) {
    if (!user) {
	    req.flash('error', '用户不存在');
		  return res.redirect('/login');
    }
           
    if (user.password != password) {
	    req.flash('error', '用户名或密码错误');
	    return res.redirect('/login');
    }
    req.session.user = user;
    req.flash('success', req.session.user.name + '登录成功');
    res.redirect('/');
  });
});


// logout
router.get("/logout", checkLogin);
router.get("/logout",function(req,res) {
	req.session.user = null;
	req.flash('success', '退出成功');
	res.redirect('/');
});


// post=========
router.post("/post",checkLogin);
router.post("/post",function(req,res) {
	var currentUser = req.session.user;
	console.log(req.session.user.name)
	var post = new Post(currentUser.name, req.body.post);
  if (req.body.post !== '') {
    post.save(function(err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', '发表成功');
    res.redirect('/u/' + currentUser.name);
  });
  }
	
});

// router.delete("/post",function (req,res) {
//   Post.remove(user._id,function (err,posts) {
//     if (err) {
//       req.flash('error',err);
//       return res.redirect("/");
//     }
//     res.render('user',{
//       title: user.name,
//       // Post回调函数从数据库传来的posts数据
//       posts: posts
//     })
//   })
// })

router.get("/u/:user",function(req,res) {
	User.get(req.params.user, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/');
		}
		Post.get(user.name, function(err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('user', {
				title: user.name,
				// Post回调函数从数据库传来的posts数据
				posts: posts
			});
		});
	});
});



// 页面权限控制，登出功能只对已经完成登录的人显示，登录功能只对还未登录的人显示
// 通过路由中间件，调用next（）函数实现view页面的控制转移
function checkLogin(req,res,next) {
  if (!req.session.user) {
    req.flash('error','未登录');
    return res.redirect('/login');
  }
  next();
}

function checkNotLogin(req,res,next) {
  if (req.session.user) {
    req.flash('error','已登录');
    return res.redirect('/');
  }
  next();
}


module.exports = router;
