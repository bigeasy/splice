require('./proof')(1, prove)

function prove (async, assert) {
    var splice = require('../..')
    var Advance = require('advance')

    function Bogus () {
    }

    Bogus.prototype.mutator = function (key, callback) {
        callback(new Error('bogus'))
    }

    console.log('starting')
    async([function () {
        var primary = new Bogus()
        var iterator = new Advance([{ key: 'a', record: 'a' }])
        splice(function () {}, primary, iterator, async())
    }, function (error) {
        assert(error.message, 'bogus', 'caught error')
    }], function () {
        console.log('done')
    })
}
