require('./proof')(1, prove)

function prove (async, assert) {
    var splice = require('../..')
    var strata = createStrata({ leafSize: 3, branchSize: 3, directory: tmp })

    function Multiple () {
        this._arrays = [[], [{ key: 'j', record: 'j' }], [{ key: 'k', record: 'k' }]]
    }

    Multiple.prototype.next = function (callback) {
        this._index = 0
        callback(null, !!(this._array = this._arrays.shift()))
    }

    Multiple.prototype.get = function () {
        return this._array[this._index++]
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
