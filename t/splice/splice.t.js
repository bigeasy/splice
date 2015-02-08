require('./proof')(2, prove)

function prove (async, assert) {
    var splice = require('../..')
    var strata = createStrata({ leafSize: 3, branchSize: 3, directory: tmp })
    async(function () {
        serialize(__dirname + '/fixtures/data.json', tmp, async())
    }, function () {
        strata.open(async())
    }, function () {
        var iterator = [ 'b', 'c', 'g', 'i', 'j' ].map(function (letter) {
            return { key: letter, record: letter }
        })
        splice(function (incoming, existing) {
            return incoming.record == 'b' || incoming.record == 'j' ? 'delete' : 'insert'
        }, strata, iterator, async())
    }, function () {
        gather(strata, async())
    }, function (records) {
        assert(records, [ 'a', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ], 'spliced')
        splice(function (incoming, existing) {
            return incoming.record == 'b' || incoming.record == 'j' ? 'delete' : 'insert'
        }, strata, function () { return null }, async())
    }, function () {
        gather(strata, async())
    }, function (records) {
        assert(records, [ 'a', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ], 'empty')
        strata.close(async())
    })
}
