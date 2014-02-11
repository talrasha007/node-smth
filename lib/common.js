var _ = require('underscore'),
    request = require('request');

exports.request = function () {
    var args = _.toArray(arguments);
    return function (cb) {
        args.push(cb);
        request.apply(null, args);
    };
};
