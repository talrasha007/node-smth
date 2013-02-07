var nforumApi = require('./lib/nforumApi.js'),
    webApi = require('./lib/webApi.js');

exports.getClient = function (host, base, appkey, type) {
    if (!type) switch (host) {
        case 'api.byr.cn':
        case 'nforum.byr.edu.cn':
            type = 'nforum';
            break;
        case 'm.newsmth.net':
            type = 'web';
            break;
    }

    switch (type) {
        case 'nforum':
            return new nforumApi(host, base, appkey);
        case 'web':
            return new webApi(host, base);
    }    
};
