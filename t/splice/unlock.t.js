require('./proof')(1, function (step, assert) {
    var splice = require('../..')
    var advance = require('advance')

    function Bogus () {
    }

    Bogus.prototype.mutator = function (key, callback) {
        callback(new Error('bogus'))
    }

    var iterator = advance([ 'a' ], function (record, callback) {
        console.log('errored')
        callback(null, record, record)
    })

    console.log('starting')
    step([function () {
        var primary = new Bogus()
        console.log('invoking error')
        splice(function () {}, primary, iterator, step())
    }, function (_, error) {
        assert(error.message, 'bogus', 'caught error')
    }], function () {
        console.log('done')
        iterator.unlock(step())
    })
})
