//var api = new require('../index.js').getClient('api.byr.cn', '', 'your app key');
var api = new require('../index.js').getClient('nforum.byr.edu.cn', '/nforum/api', ''); // BYR Test Server

api.login('guest', '', function (e, data) {
    console.log(arguments);
});

api.queryUser('id', function (e, data) {
    console.log(arguments);
});

api.logout(function (e, data) {
    console.log(arguments);
});
