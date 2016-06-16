var mongodb = require('../schemas/db');

function User(user) {
	this.name = user.name;
	this.password = user.password;
};



User.prototype.save = function (callback) {
	// 存入数据库
	var user = {
		name: this.name,
		password: this.password
	};
	mongodb.open(function (err,db) {
		if (err) {
			return callback(err);
		}
		// 读取users 集合
		db.collection('users',function (err,collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 为 name 添加索引
			collection.ensureIndex('name',{unique: true});
			// 写入 user 文档
			collection.insert(user,{safe: true},function (err,user) {
				mongodb.close();
				callback(err,user);
			})
		})
	})
};


User.get = function get(username,callback) {
	mongodb.open(function (err,db) {
		if (err) {
			return callback(err);
		}
		// 读取users 集合
		db.collection('users',function (err,collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 查找name == username 的数据
			collection.findOne({name: username},function (err,doc) {
				mongodb.close();
				if (doc) {
					// 将找到的数据封装为对象
					var user = new User(doc);
					callback(err,user);
				}else{
					callback(err,null);
				}
			});
		});
	});
};


module.exports = User;