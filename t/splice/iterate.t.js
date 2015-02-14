require('./proof')(1, prove)

function prove (async, assert) {
    var splice = require('../..')
    var Advance = require('advance')
    var strata = createStrata({ leafSize: 3, branchSize: 3, directory: tmp })

    function Multiple () {
        this._arrays = [[{ key: 'j', record: 'j' }], [{ key: 'k', record: 'k' }]]
    }

    Multiple.prototype.next = function (callback) {
        callback(null, this._arrays.shift())
    }

    async(function () {
        serialize(__dirname + '/fixtures/data.json', tmp, async())
    }, function () {
        strata.open(async())
    }, function () {
        splice(function (incoming, existing) {
            return 'insert'
        }, strata, new Multiple(), async())
    }, function () {
        gather(strata, async())
    }, function (records) {
        assert(records, [ 'a', 'b', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k' ], 'iterated')
    })
}
