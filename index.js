var nforumApi = require('./lib/nforumApi.js');

exports.getClient = function (host, base, appkey) {
    switch (host) {
        case 'api.byr.cn':
            return new nforumApi(host, base, appkey);
    }
};
