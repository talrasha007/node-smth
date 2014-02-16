var _ = require('underscore'),
    url = require('url'),
    request = require('request'),
    iconv = require('iconv-lite'),

    cm = require('./common.js');

var apiDesc = {
    'login': { method: 'POST', url: '/user/ajax_login.json' },
    'logout': { url: '/user/ajax_logout.json' },
    'user.query': { url: '/user/query/:id.json' }
};

module.exports = function (host, base, appkey) {
    this.host = host;
    this.base = base || '';
    this.appkey = appkey;
    this.jar = request.jar();
};

module.exports.prototype = {
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
        this.userInfo = yield this._request('login', { id: username, passwd: password, save: 'on' });
        return true;
    },

    logout: function *() {
        if (!this.auth) return true;

        yield this._request('logout');
        return true;
    },

    queryUser: function *(id) {
        if (!id) return this.userInfo;

        return yield this._request('user.query', { id: id });
    },

    _request: function *(api, param) {
        var reqParam = {
            method: apiDesc[api].method || "GET",
            url: url.format({ protocol: 'http', host: this.host, pathname: this.base + apiDesc[api].url }),
            headers: {
                'Referer': url.format({ protocol: 'http', host: this.host, pathname: this.base }),
                'X-Requested-With': 'XMLHttpRequest'
            },
            jar: this.jar,
            json: false,
            encoding: null
        };

        if (param) for (var f in param) {
            if (reqParam.url.indexOf(":" + f) >= 0) {
                reqParam.url = reqParam.url.replace(":" + f, param[f]);
                delete param[f];
            }
        }

        if (reqParam.method == 'POST') reqParam.form = param;

        var ret = yield cm.request(reqParam);
        if (!ret[1]) throw new Error('Request failed...');
        var obj = JSON.parse(iconv.decode(ret[1], 'GBK'));
        if (obj.ajax_code !== '0005') throw new Error(JSON.stringify({ code: obj.ajax_code, msg: obj.ajax_msg }));

        return obj;
    }
};
