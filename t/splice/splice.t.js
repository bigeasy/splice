require('./proof')(1, prove)

function prove (async, assert) {
    var splice = require('../..')
    var advance = require('advance')
    var strata = new Strata({ leafSize: 3, branchSize: 3, directory: tmp })
    async(function () {
        serialize(__dirname + '/fixtures/data.json', tmp, async())
    }, function () {
        strata.open(async())
    }, function () {
        var iterator = advance([ 'b', 'c', 'g', 'i', 'j' ], function (record, callback) {
            callback(null, record, record)
        })
        splice(function (incoming, existing) {
            return incoming.record == 'b' || incoming.record == 'j' ? 'delete' : 'insert'
        }, strata, iterator, async())
    }, function () {
        gather(strata, async())
    }, function (records) {
        console.log(records)
        assert(records, [ 'a', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ], 'spliced')
        strata.close(async())
    })
}
