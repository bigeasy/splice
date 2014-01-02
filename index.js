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
                    this._mutator.remove(index, step())
                }
            }, function () {
                if (operation == 'insert') {
                    step(function () {
                        this._mutator.insert(record, key, index, step())
                    }, function (result) {
                        if (result != 0) {
                            ok(result > 0, 'went backwards')
                            this._mutator.unlock()
                            delete this._mutator
                            step(operate)
/*                            step(function () {
                                this._primary.mutator(key, step())
                            }, function ($) {
                                this._mutator = $
                                this._mutator.insert(record, key, ~ this._mutator.index, step())
                            })*/
                        }
                    })
                }
            })
        })(1)
        else step(null)
    })()
})

Splice.prototype.unlock = function () {
    if (this._mutator) this._mutator.unlock()
}

module.exports = cadence(function (step, operation, primary, iterator) {
    var splice = new Splice(operation, primary, iterator)
    step([function () {
        splice.unlock()
    }], function () {
        splice.splice(step())
    })
})
