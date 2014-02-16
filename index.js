var wwwApi = require('./lib/wwwApi.js');

exports.getClient = function (name) {
    switch (name) {
        case 'byr':
            return new wwwApi('m.byr.cn', '', 'bbs.byr.cn', '');
        case 'smth':
            return new wwwApi('m.newsmth.net', '', 'www.newsmth.net', 'nForum');
    }
};
