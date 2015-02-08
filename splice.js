var cadence = require('cadence/redux')
var ok = require('assert').ok

function Splice (operation, primary, iterator) {
    var _iterator = iterator

    if (Array.isArray(_iterator)) {
        var index = 0
        _iterator = function () { return iterator[index++] }
    }

    this._operation = operation
    this._primary = primary
    this._iterator = _iterator
}


Splice.prototype.splice = cadence(function (async) {
    var nextItem = this._iterator
    var item = nextItem()
    if (item == null) {
        return []
    }
    var operate = async(function () {
        this._primary.mutator(item.key, async())
    }, function (mutator) {
        this._mutator = mutator
        var index = mutator.index, existing
        for (;;) {
            if (index < 0) {
                if (mutator.length < ~index) {
                    async(function () {
                        this._mutator = null
                        mutator.unlock(async())
                    }, function () {
                        return [ operate() ]
                    })
                    return
                } else {
                    index = ~index
                    existing = null
                }
            } else {
                existing = mutator.get(index)
            }
            var operation = this._operation(item, existing)
            if ((operation == 'insert' || operation == 'delete') && existing) {
                mutator.remove(index)
                index = ~mutator.indexOf(item.key, mutator.ghosts)
            }
            if (operation == 'insert') {
                mutator.insert(item.record, item.key, index)
            }
            item = nextItem()
            if (item == null) {
                break
            }
            index = mutator.indexOf(item.key, mutator.ghosts)
        }
        return [ operate ]
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
