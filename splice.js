const Strata = require('b-tree')
// Now that the rest of the iteration utilities are based on riffle, which
// slices the b-tree page array, we don't have to think hard at all about
// updating, but even if we didn't take a slice this implementation releases
// cursors between synchronous operations, so that as long as you're continuing
// to merge queries in the midst of the splice, which you must do anyway, you're
// not going to have any race conditions.
//
// There will only ever be one strand updating the primary tree.
//
module.exports = async function (operator, strata, iterator) {
    function upsert (cursor, index, found, { key, parts }) {
        if (found) {
            cursor.remove(index, writes)
        }
        if (parts != null) {
            cursor.insert(index, key, parts, writes)
        }
    }
    const writes = {}, promises = [], scope = { items: null }
    while (! iterator.done) {
        iterator.next(promises, items => scope.items = items)
        while (promises.length != 0) {
            await promises.shift()
        }
        const operations = scope.items.map(item => operator(item))
        while (operations.length != 0) {
            strata.search(promises, operations[0].key, cursor => {
                let { found, index } = cursor
                upsert(cursor, index, found, operations.shift())
                while (operations.length != 0) {
                    ({ index, found } = cursor.indexOf(operations[0].key, index))
                    if (index == null) {
                        break
                    }
                    upsert(cursor, index, found, operations.shift())
                }
            })
            while (promises.length != 0) {
                await promises.shift()
            }
        }
    }
    await Strata.flush(writes)
}
