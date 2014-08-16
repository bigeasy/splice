require('./proof')(1, function (step, serialize, deepEqual, Strata, tmp, gather) {
    var splice = require('../..')
    var advance = require('advance')
    var strata = new Strata({ leafSize: 3, branchSize: 3, directory: tmp })
    step(function () {
        serialize(__dirname + '/fixtures/data.json', tmp, step())
    }, function () {
        strata.open(step())
    }, function () {
        var iterator = advance([ 'b', 'c', 'g', 'i', 'j' ], function (record, callback) {
            callback(null, record, record)
        })
        splice(function (incoming, existing) {
            return incoming.record == 'b' || incoming.record == 'j' ? 'delete' : 'insert'
        }, strata, iterator, step())
    }, function () {
        gather(strata, step())
    }, function (records) {
        console.log(records)
        deepEqual(records, [ 'a', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ], 'spliced')
        strata.close(step())
    })
})
