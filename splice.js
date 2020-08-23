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
module.exports = async function (operator, strata, paginator) {
    const writes = {}
    for await (const page of paginator) {
        let cursor = Strata.nullCursor(), index = 0, found = false
        for (const item of page) {
            index = cursor.indexOf(item.key, index)
            if (index == null) {
                cursor.release()
                cursor = (await strata.search(item.key)).get()
                ; ({ index, found } = cursor)
            } else {
                if (!(found = index >= 0)) {
                    index = ~index
                }
            }
            if (found) {
                cursor.remove(index, writes)
            }
            const parts = operator(item)
            if (parts != null) {
                cursor.insert(index, parts, writes)
            }
        }
        cursor.release()
    }
    await Strata.flush(writes)
}
