var co = require('co'),
    assert = require('assert'),

    Api = require('../lib/webApi.js'),
    mw = new Api('www.newsmth.net', 'nForum');

describe('mweb api', function () {
    it('should work as expected.', co(function *() {
        assert.equal(yield mw.login('guest', 'foobar'), true);

        var auth = mw.getAuthToken();
        mw.setAuthToken(auth);
        assert.deepEqual(auth, mw.getAuthToken());

        assert.equal((yield mw.queryUser()).id, 'guest');
        assert.equal((yield mw.queryUser('ttl')).id, 'ttl');

        assert.equal(yield mw.logout(), true);
    }));
});
