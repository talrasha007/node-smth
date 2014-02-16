var util = require('util'),
    mw = require('./mwebApi.js'),
    ww = require('./webApi.js');

var exHosts = {};

var wwwApi = module.exports = function (host, base, exHost, exBase) {
    mw.call(this, host, base);

    this.exApi = exHosts[exHost + exBase];
    if (!this.exApi) {
        this.exApi = exHosts[exHost + exBase] = new ww(exHost, exBase);
    }
};

util.inherits(wwwApi, mw);

wwwApi.prototype.queryUser = function *(id) {
    if (!this.exApi.auth) yield this.exApi.login('guest', 'foobar');
    return yield this.exApi.queryUser(id);
};