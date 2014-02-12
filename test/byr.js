var co = require('co'),
    assert = require('assert'),

    Api = require('../lib/nforumApi.js'),

    nf = new Api('nforum.byr.edu.cn', '/byr/api');
    // nf = new Api('api.byr.cn', '', 'your app key');

describe('nforum api', function () {
    it('should work as expected.', co(function *() {
        assert.equal(yield nf.login('guest', 'foobar'), true);

        var auth = nf.getAuthToken();
        nf.setAuthToken(auth);
        assert.deepEqual(auth, nf.getAuthToken());

        assert.equal(yield nf.logout(), true);

        assert.equal((yield nf.queryUser()).id, 'guest');
        assert.equal((yield nf.queryUser('TTL')).id, 'TTL');

        yield nf.getFavorite(0);
    }));
});
