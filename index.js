var nforumApi = require('./lib/nforumApi.js');

exports.getClient = function (host, base, appkey, type) {
    if (!type) switch (host) {
        case 'api.byr.cn':
        case 'nforum.byr.edu.cn':
            type = 'nforum';
    }

    switch (type) {
        case 'nforum':
            return new nforumApi(host, base, appkey);
        case '':
            return;
    }    
};
