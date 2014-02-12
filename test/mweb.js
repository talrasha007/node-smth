var co = require('co'),
    assert = require('assert'),

    Api = require('../lib/mwebApi.js'),
    mw = new Api('m.newsmth.net');

describe('mweb api', function () {
    it('should work as expected.', co(function *() {
        assert.equal(yield mw.login('guest'), true);

        var auth = mw.getAuthToken();
        mw.setAuthToken(auth);
        assert.deepEqual(auth, mw.getAuthToken());

        //console.log(auth);

        assert.equal(yield mw.logout(), true);
    }));
});
