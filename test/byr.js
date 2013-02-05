var api = new require('../index.js').getClient('api.byr.cn', '', 'your app key');

api.login('guest', '', function (e, data) {
    console.log(arguments);
});

api.queryUser('id', function (e, data) {
    console.log(arguments);
});
