require('./proof')(1, prove)

function prove (async, assert) {
    var splice = require('../..')
    var advance = require('advance')

    function Bogus () {
    }

    Bogus.prototype.mutator = function (key, callback) {
        callback(new Error('bogus'))
    }

    async([function () {
        var primary = new Bogus()
        var iterator = advance.forward(null, [{ key: 'a', record: 'a' }])
        splice(function () {}, primary, iterator, async())
    }, function (error) {
        assert(error.message, 'bogus', 'caught error')
    }])
}
