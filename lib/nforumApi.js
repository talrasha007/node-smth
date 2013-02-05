﻿var _ = require('underscore'),
    url = require('url'),
    path = require('path'),
    request = require('request');

var apiDesc = {
    'login': { url: '/user/login.json' },
    'logout': { url: '/user/logout.json' },
    'user.query': { url: '/user/query/:id.json' }
};

module.exports = function (host, base, appkey) {
    this.host = host;
    this.base = base;
    this.appkey = appkey;
};

module.exports.prototype = {
    login: function (username, password, cb) {
        this._request('login', null, username, password, cb);
    },

    logout: function (username, password, cb) {
        this._request('logout', null, username, password, cb);
    },

    queryUser: function (id, username, password, cb) {
        this._request('user.query', { id: id }, username, password, cb);
    },

    _request: function (api, param, username, password, cb) {
        var reqParam = {
            method: apiDesc[api].method || "GET",
            url: url.format({ protocol: 'http', host: this.host, pathname: this.base + apiDesc[api].url, query: { appkey: this.appkey } }),
            auth: username + ':' + password
        };

        if (param) for (var f in param) {
            reqParam.url = reqParam.url.replace(":" + f, param[f]);
            delete param[f];
        }

        if (reqParam.method == 'POST') reqParam.form = param;

        //return console.log(reqParam);
        request(reqParam, function (e, r, body) {
            if (e) return cb && cb({ code: -1, msg: '请求失败' });

            try {
                var ret = JSON.parse(body);
                cb && cb((ret.code && ret.msg && ret), ret);
            } catch (e) {
                cb && cb({ code: -1, msg: '数据错误', body: body });
            }            
        });
    }    
};
