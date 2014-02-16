var _ = require('underscore'),
    url = require('url'),
    path = require('path'),
    request = require('request'),

    cm = require('./common.js');

var apiDesc = {
    'login': { method: 'POST', url: '/user/login' },
    'logout': { url: '/user/logout' },
    'user.query': { url: '/user/query/:id' },
    'favorite.get': { url: '/favor/:level' },
    'top10': { url: '/hot' },
    'board': { url: '/board/:board' },
    'thread': { url: '/article/:board/:id' }
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

    getFavorite: function *(lvl) {
        var ret = yield this._request('favorite.get', { level: lvl || 0 }),
            folderReg = /<a href="\/favor\/(\d+?)">(.+?)</ig,
            boardReg = /<a href="\/board\/(.+?)">(.+?)\(/ig,
            fav = { sub_favorite: [], board: [] },
            m;

        while (m = folderReg.exec(ret[1])) {
            fav.sub_favorite.push({ level: m[1], name: m[2] });
        }

        while (m = boardReg.exec(ret[1])) {
            fav.board.push({ name: m[1], description: m[2] });
        }

        return fav;
    },

    getTop10: function *() {
        var ret = yield this._request('top10'),
            threadReg = /<a href="\/article\/(.+?)\/(\d+?)">(.+?)\(<span.+?>(\d+?)</ig,
            threads = [],
            m;

        while (m = threadReg.exec(ret[1])) {
            threads.push({ id: m[2], title: m[3], board_name: m[1], reply_count: m[4] });
        }

        return threads;
    },

    getBoard: function *(name, page) {
        var ret = yield this._request('board', { board: name, p: page || 1 }),
            threadReg = /<a href="\/article\/([^<>]+?)\/(\d+?)"( class="(.+?)")?>([^<>]+?)<\/a>\((\d+?)\).+?(\d+[:-]\d+[:-]\d+).+?<a href="\/user\/query\/(.+?)"/ig,
            board = { article: [], pagination: { page_all_count: 0, page_current_count: 0 } },
            m;

        while (m = threadReg.exec(ret[1])) {
            var thread = { id: m[2], title: m[5], board_name: m[1], reply_count: m[6], post_time: m[7], user: m[8] };
            if (m[4]) thread.flag = m[4];
            board.article.push(thread);
        }

        m = /(\d+)\/(\d+)/.exec(ret[1]);
        if (m) {
            board.pagination.page_current_count = m[1];
            board.pagination.page_all_count = m[2];
        }

        return board;
    },

    getThread: function *(board, id, page) {
        var ret = yield this._request('thread', { board: board, id: id, p: page || 1 }),
            arReg = /<li( class="hla")?>(.+?)<\/li>/ig,
            thread = { board_name: board, id: id, article: [], pagination: { page_all_count: 0, page_current_count: 0 } },
            m;

        var arString = /<ul class="list sec">.+?<\/ul>/.exec(ret[1])[0];
        while (m = arReg.exec(arString)) {
            var ar = m[0];
            thread.article.push({
                id: /<a href="\/article\/\w+\/post\/(\d+)">/.exec(ar)[1],
                user: /<a href="\/user\/query\/(.+?)">/.exec(ar)[1],
                post_time: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.exec(ar)[0],
                content: /<div class="sp">(.+?)<\/div>/im.exec(ar)[1]
            });
        }

        m = /(\d+)\/(\d+)/.exec(ret[1]);
        if (m) {
            thread.pagination.page_current_count = m[1];
            thread.pagination.page_all_count = m[2];
        }

        return thread;
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

        //console.log(reqParam);
        if (reqParam.method == 'POST') reqParam.form = param;

        return cm.request(reqParam);
    }
};
