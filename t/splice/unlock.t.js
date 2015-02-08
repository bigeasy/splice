require('./proof')(1, prove)

function prove (async, assert) {
    var splice = require('../..')

    function Bogus () {
    }

    Bogus.prototype.mutator = function (key, callback) {
        callback(new Error('bogus'))
    }

    console.log('starting')
    async([function () {
        var primary = new Bogus()
        console.log('invoking error')
        splice(function () {}, primary, function () { return { key: 'a', record: 'a' } }, async())
    }, function (error) {
        assert(error.message, 'bogus', 'caught error')
    }], function () {
        console.log('done')
    })
}
