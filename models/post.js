var mongodb = require('../schemas/db.js');

function Post(username,post,time) {
	this.user = username;
	this.post = post;
	var date = new Date();
	if (time) {
		this.time = time;
	}else{
		this.time = date.toLocaleString();
	}
};

Post.prototype.save = function save(callback) {
	// 将留言存入数据库
	var post = {
		user: this.user,
		post: this.post,
		time: this.time
	};
	// 打开数据库
	mongodb.open(function (err,db) {
		if (err) {
			return callback(err);
		}
		// 读取数据库中所有的post
		db.collection('posts',function (err,collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 为user 属性添加索引
			collection.ensureIndex('user');
			// 写入 post 数据文档中 insert
			collection.insert(post,{safe: true},function (err,post) {
				mongodb.close();
				// 通过save方法的回调函数传递post数据
				callback(err,post);
			})
		})
	})
};

 
Post.get = function get(username,callback) {
	// 打开数据库
	mongodb.open(function (err,db) {
		if (err) {
			return callback(err);
		}
		// 读取数据库中所有的post
		db.collection('posts',function (err,collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 查找 username 对应的post数据文档
			var query = {};
			if (username) {
				query.user = username;
			}
			collection.find(query).sort({time: -1}).toArray(function (err,docs) {
				mongodb.close();
				if (err) {
					callback(err,null);
				}
				// 将post 封装为Post对象
				var posts = [];
				docs.forEach(function (doc,index) {
					var post = new Post(doc.user,doc.post,doc.time);
					posts.push(post);
				})
				// 将封装后的所有posts数据通过get方法的回调函数传递给前台
				callback(null,posts);
			})
		})
	})
};



Post.remove = function remove(id,callback) {
	// 打开数据库
	mongodb.open(function (err,db) {
		if (err) {
			return callback(err);
		}
		// 读取数据库中所有的post
		db.collection('posts',function (err,collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 查找 username 对应的post数据文档
			var query = {};
			if (id) {
				query._id = id;
			}
			collection.remove(query);
			mongodb.close();
			callback(null,posts);
			// collection.find(query).sort({time: -1}).toArray(function (err,docs) {
			// 	mongodb.close();
			// 	if (err) {
			// 		callback(err,null);
			// 	}
			// 	// 将post 封装为Post对象
			// 	var posts = [];
			// 	docs.forEach(function (doc,index) {
			// 		var post = new Post(doc.user,doc.post,doc.time);
			// 		posts.push(post);
			// 	})
			// 	// 将封装后的所有posts数据通过get方法的回调函数传递给前台
			// 	callback(null,posts);
			// })
		})
	})
};

module.exports = Post;