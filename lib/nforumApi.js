var _ = require('underscore'),
    url = require('url'),
    path = require('path'),
    request = require('request'),

    cm = require('./common.js');

var apiDesc = {
    'login': { url: '/user/login.json' },
    'logout': { url: '/user/logout.json' },
    'user.query': { url: '/user/query/:id.json' },
    'favorite.get': { url: '/favorite/:level.json' },
    'top10': { url: '/widget/topten.json' },
    'board': { url: '/board/:board.json' },
    'thread': { url: '/threads/:board/:id.json' }
};

module.exports = function (host, base, appkey) {
    this.host = host;
    this.base = base || '';
    this.appkey = appkey;
};

module.exports.prototype = {
    getAuthToken: function () {
        return JSON.stringify(this.auth);
    },

    setAuthToken: function (auth) {
        this.auth = JSON.parse(auth);
    },

    login: function *(username, password) {
        this.auth = { username: username, password: password };

        this.userInfo = yield this._request('login');
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

    getFavorite: function *(lvl) {
        return yield this._request('favorite.get', { level: lvl });
    },

    getTop10: function *() {
        return yield this._request('top10');
    },

    getBoard: function *(board, page) {
        return yield this._request('board', { board: board, page: page });
    },

    getThread: function *(board, id, page) {
        return yield this._request('thread', { board: board, id: id, page: page });
    },

    _request: function *(api, param) {
        var reqParam = {
            method: apiDesc[api].method || "GET",
            url: url.format({ protocol: 'http', host: this.host, pathname: this.base + apiDesc[api].url, query: { appkey: this.appkey } }),
            auth: this.auth,
            json: true,
            jar: false
        };

        if (param) for (var f in param) {
            if (reqParam.url.indexOf(":" + f) >= 0) {
                reqParam.url = reqParam.url.replace(":" + f, param[f]);
                delete param[f];
            }
        }

        if (reqParam.method == 'POST') reqParam.form = param;
        else if (!_.isEmpty(param)) reqParam.qs = param;

        //console.log(reqParam);
        var ret = yield cm.request(reqParam);
        if (!ret[1] || ret[1].msg) throw new Error(JSON.stringify(ret[1]));

        return ret[1];
    }
};
