var _ = require('underscore'),
    url = require('url'),
    path = require('path'),
    request = require('request'),
    async = require('async');

var apiDesc = {
    'login': { method: 'POST', url: '/user/login' },
    'logout': { url: '/user/logout' },
    'user.query': { url: '/user/query/:id' },
    'favorite.get': { url: '/favor/:level' }
};

module.exports = function (host, base, appkey) {
    this.host = host;
    this.base = base;
    this.appkey = appkey;
};

module.exports.prototype = {
    login: function (username, password, cb) {
        var me = this, auth;
        async.waterfall([
            function (callback) {
                me._request('login', { id: username, passwd: password, save: 'on' }, null, callback);
            },
            function (data, callback) {
                if (data.statusCode != 302) return callback({ code: "0101", msg: "您的用户名并不存在，或者您的密码错误" });

                auth = data.auth;
                me.queryUser(username, auth, callback);
            }
        ], function (err, user) {
            cb && cb(err, user, auth);
        });
    },

    logout: function (auth, cb) {
        this._request('logout', null, auth, function (err, data) {
            cb(err);
        });
    },

    queryUser: function (id, auth, cb) {
        this._request('user.query', { id: id }, auth, function (err, data) {
            if (err) return cb && cb(err);
            if (data.statusCode != 200) return cb && cb({ code: -1, msg: '请求失败' });

            var body = data.body.replace(/&nbsp;/g, ' ');
            var fields = {
                id:              /<li.*?>ID:\s*(.*?)<\/li>/g,
                user_name:       /<li.*?>昵称:\s*(.*?)<\/li>/g,
                gender:          /<li.*?>性别:\s*(.*?)<\/li>/g,
                astro:           /<li.*?>星座:\s*(.*?)<\/li>/g,
                life:            /<li.*?>生命力:\s*(.*?)<\/li>/g,
                level:           /<li.*?>等级:\s*(.*?)<\/li>/g,
                is_online:       /<li.*?>当前状态:\s*(.*?)<\/li>/g,
                post_count:      /<li.*?>贴数:\s*(.*?)<\/li>/g,
                last_login_time: /<li.*?>上次登录:\s*(.*?)<\/li>/g,
                last_login_ip:   /<li.*?>最后访问IP:\s*(.*?)<\/li>/g
            };
            
            var user = {};
            _.each(fields, function (reg, f) {
                var m = reg.exec(body);
                if (m) user[f] = m[1];
            });
            user.is_online = user.is_online && user.is_online.indexOf('不') < 0;
            cb && cb(null, user);
        });
    },

    getFavorite: function (lvl, auth, cb) {
        this._request('favorite.get', { level: lvl }, auth, function (err, data) {
            if (err) return cb && cb(err);
            if (data.statusCode != 200) return cb && cb({ code: -1, msg: '请求失败' });
            if (data.body.indexOf('错误') >= 0) return cb && cb({ code: -1, msg: '读取收藏版面错误' });
            
            data.body.replace(/&nbsp;/g, ' ');
            var f = [];
            data.body.replace(/<li.*?>版面\|<a href="\/board\/(.*?)">(.*?)<\/a><\/li>/g, function (m, name, desc) {
                f.push({ name: name, description: desc });
                return '';
            });
            cb && cb(null, { board: f });
        });
    },

    _request: function (api, param, auth, cb) {
        var reqParam = {
            method: apiDesc[api].method || "GET",
            url: url.format({ protocol: 'http', host: this.host, pathname: this.base + apiDesc[api].url }),
            jar: auth || request.jar()
        };

        if (param) for (var f in param) {
            if (reqParam.url.indexOf(":" + f) >= 0) {
                reqParam.url = reqParam.url.replace(":" + f, param[f]);
                delete param[f];
            }
        }

        if (reqParam.method == 'POST') reqParam.form = param;

        //return console.log(reqParam);
        request(reqParam, function (e, r, body) {
            if (e) return cb && cb({ code: -1, msg: '请求失败' });

            cb && cb(null, { body: body, auth: reqParam.jar, statusCode: r.statusCode });
        });
    }
};
