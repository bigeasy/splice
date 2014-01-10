require('./proof')(1, function (step, serialize, deepEqual, Strata, tmp, gather) {
    var splice = require('../..')
    var advance = require('advance')

    function Bogus () {
    }
    Bogus.prototype.mutator = function (key, callback) {
        callback(new Error('bogus'))
    }

    var iterator = advance([ 'a' ], function (record, callback) {
        callback(null, record, record)
    })
    step([function () {
        var primary = new Bogus()
        splice(function () {}, primary, iterator, step())
    }, function (_, error) {
        deepEqual(error.message, 'bogus', 'caught error')
    }], function () {
        iterator.unlock()
    })
})
