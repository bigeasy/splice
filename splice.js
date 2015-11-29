var cadence = require('cadence')
var ok = require('assert').ok

function Splice (operation, primary, iterator) {
    this._operation = operation
    this._primary = primary
    this._iterator = iterator
}


Splice.prototype.splice = cadence(function (async) {
    var i, index, item
    var iterate = async(function () {
        this._iterator.next(async())
        i = 0
    }, function (more) {
        if (!more) {
            return [ iterate.break ]
        }
        item = this._iterator.get()
        if (item == null) {
            return [ iterate.continue ]
        }
        var mutate = async(function () {
            var mutator = this._mutator
            if (mutator == null) {
                async(function () {
                    this._primary.mutator(item.key, async())
                }, function (mutator) {
                    return [ this._mutator = mutator, mutator.index ]
                })
            } else {
                return [ mutator, mutator.indexOf(item.key, mutator.page.ghosts) ]
            }
        }, function (mutator, index) {
            var operation, existing
            for (;;) {
                if (index < 0) {
                    if (mutator.page.items.length < ~index) {
                        async(function () {
                            this._mutator = null
                            mutator.unlock(async())
                        }, function () {
                            return [ mutate.continue ]
                        })
                        return
                    } else {
                        index = ~index
                        existing = null
                    }
                } else {
                    existing = mutator.page.items[index]
                }
                operation = this._operation(item, existing)
                if ((operation == 'insert' || operation == 'delete') && existing) {
                    mutator.remove(index)
                    index = ~mutator.indexOf(item.key, mutator.page.ghosts)
                }
                if (operation == 'insert') {
                    mutator.insert(item.record, item.key, index)
                }
                item = this._iterator.get()
                if (item == null) {
                    return [ iterate.continue ]
                }
                index = mutator.indexOf(item.key, mutator.page.ghosts)
            }
        })()
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
