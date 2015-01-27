var cadence = require('cadence')
var ok = require('assert').ok

function Splice (operation, primary, iterator) {
    this._operation = operation
    this._primary = primary
    this._iterator = iterator
}

Splice.prototype.splice = cadence(function (async) {
    async(function () {
        this._iterator.next(async())
    }, function (record, key) {
        var operate
        if (record && key) operate = async(function () {
           if (!this._mutator) {
                this._primary.mutator(key, async(async)(function ($) {
                    this._mutator = $
                    return this._mutator.index
                }))
            } else {
                this._mutator.indexOf(key, async())
            }
        }, function (index) {
            if (index < 0) {
                if (this._mutator.length < ~index) {
                    async(function () {
                        this._mutator.unlock(async())
                    }, function () {
                        delete this._mutator
                        return [ operate() ]
                    })
                } else {
                    return [ ~index, null ]
                }
            } else {
                async(function () {
                    this._mutator.get(index, async())
                }, function (record, key) {
                    return [ index, { record: record, key: key } ]
                })
            }
        }, function (index, existing) {
            var operation = this._operation({ record: record, key: key }, existing)
            async(function () {
                if ((operation == 'insert' || operation == 'delete') && existing) {
                    async(function () {
                        this._mutator.remove(index, async())
                    }, function () {
                        this._mutator.indexOf(key, async())
                    }, function (index) {
                        return [ ~index ]
                    })
                } else {
                    return [ index ]
                }
            }, function (index) {
                if (operation == 'insert') {
                    async(function () {
                        this._mutator.insert(record, key, index, async())
                    })
                }
            })
        })(1)
        else return [ async ]
    })()
})

Splice.prototype.unlock = function (callback) {
    if (this._mutator) this._mutator.unlock(callback)
    else callback()
}

module.exports = cadence(function (async, operation, primary, iterator) {
    var splice = new Splice(operation, primary, iterator)
    async([function () {
        splice.unlock(async())
    }], function () {
        splice.splice(async())
    })
})
