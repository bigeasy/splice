var cadence = require('cadence')
var ok = require('assert').ok

function Splice (operation, primary, iterator) {
    this._operation = operation
    this._primary = primary
    this._iterator = iterator
}

Splice.prototype.splice = cadence(function (step) {
    step(function () {
        this._iterator.next(step())
    }, function (record, key) {
        var operate
        if (record && key) operate = step(function () {
           if (!this._mutator) {this._primary.mutator(key, step(step, function ($) {
                this._mutator = $
                return this._mutator.index
            }))} else {
                this._mutator.indexOf(key, step())
            }
        }, function (index) {
            if (index < 0) step()(null, ~ index, null)
            else step(function () {
                this._mutator.get(index, step())
            }, function (record, key) {
                step()(null, index, { record: record, key: key })
            })
        }, function (index, existing) {
            var operation = this._operation({ record: record, key: key }, existing)
            step(function () {
                if ((operation == 'insert' || operation == 'delete') && existing) {
                    step(function () {
                        this._mutator.remove(index, step())
                    }, function () {
                        this._mutator.indexOf(key, step())
                    }, function (index) {
                        return ~ index
                    })
                } else {
                    return index
                }
            }, function (index) {
                if (operation == 'insert') {
                    step(function () {
                        this._mutator.insert(record, key, index, step())
                    }, function (result) {
                        if (result != 0) {
                            ok(result > 0, 'went backwards')
                            step(function () {
                                this._mutator.unlock(step())
                            }, function () {
                                delete this._mutator
                                return [ operate() ]
                            })
                        }
                    })
                }
            })
        })(1)
        else step(null)
    }, function () {
        setImmediate(step())
    })()
})

Splice.prototype.unlock = function (callback) {
    if (this._mutator) this._mutator.unlock(callback)
    else callback()
}

module.exports = cadence(function (step, operation, primary, iterator) {
    var splice = new Splice(operation, primary, iterator)
    step([function () {
        splice.unlock(step())
    }], function () {
        splice.splice(step())
    })
})
