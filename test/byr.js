//var api = new require('../index.js').getClient('api.byr.cn', '', 'your app key');
var api = new require('../index.js').getClient('nforum.byr.edu.cn', '/byr/api', ''); // BYR Test Server

api.login('guest', '', function (e, data) {
    console.log(arguments);
});

api.queryUser('id', 'guest', '', function (e, data) {
    console.log(arguments);
});

api.logout('guest', '', function (e, data) {
    console.log(arguments);
});
