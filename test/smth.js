var co = require('co'),
    assert = require('assert'),

    Api = require('../lib/nforumApi.js'),

    api = require('../').getClient('smth');

describe('api', function () {
    it('should work as expected.', co(function *() {
        assert.equal(yield api.login('guest', 'foobar'), true);

        var auth = api.getAuthToken();
        api.setAuthToken(auth);
        assert.deepEqual(auth, api.getAuthToken());

        assert.equal((yield api.queryUser()).id, 'guest');
        assert.equal((yield api.queryUser('ttl')).id, 'ttl');

        console.log(yield api.getTop10());
        console.log(yield api.getBoard('Skate'));
        console.log(yield api.getFavorite(0));

        assert.equal(yield api.logout(), true);
    }));
});
