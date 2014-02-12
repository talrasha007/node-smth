var _ = require('underscore'),
    url = require('url'),
    path = require('path'),
    request = require('request'),

    cm = require('./common.js');

var apiDesc = {
    'login': { method: 'POST', url: '/user/login' },
    'logout': { url: '/user/logout' },
    'user.query': { url: '/user/query/:id' },
    'favorite.get': { url: '/favor/:level' }
};

var mwebApi = module.exports = function (host, base, appkey) {
    this.host = host;
    this.base = base || '';
    this.appkey = appkey;
    this.jar = request.jar();
};

mwebApi.prototype = {
    getAuthToken: function () {
        var r;
        this.jar._jar.getCookies('http://' + this.host, function (err, cookies) {
            r = _.map(cookies, function (it) { return it.toString(); });
        });
        return r;
    },

    setAuthToken: function (auth) {
        var jar = this.jar;
        auth.forEach(function (c) {
            var cookie = request.cookie(c);
            jar.setCookie(cookie, 'http://' + cookie.domain);
        });
    },

    login: function *(username, password) {
        var ret = yield this._request('login', { id: username, passwd: password, save: 'on' });
        return ret[0].statusCode === 302;
    },

    logout: function *() {
        yield this._request('logout');
        return true;
    },

    _request: function (api, param) {
        var reqParam = {
            method: apiDesc[api].method || "GET",
            url: url.format({ protocol: 'http', host: this.host, pathname: this.base + apiDesc[api].url }),
            jar: this.jar
        };

        if (param) for (var f in param) {
            if (reqParam.url.indexOf(":" + f) >= 0) {
                reqParam.url = reqParam.url.replace(":" + f, param[f]);
                delete param[f];
            }
        }

        if (reqParam.method == 'POST') reqParam.form = param;

        return cm.request(reqParam);
    }
};
