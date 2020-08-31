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
        let cursor = Strata.nullCursor(), index, previous = 0, found = false
        for (const item of page) {
            const operation = operator(item)
            for (;;) {
                ; ({ index, found } = cursor.indexOf(operation.key, previous))
                if (index != null) {
                    break
                }
                cursor.release()
                cursor = await strata.search(operation.key)
                previous = cursor.page.ghosts
            }
            if (found) {
                cursor.remove(index, writes)
            }
            if (operation.parts != null) {
                cursor.insert(index, operation.key, operation.parts, writes)
            }
            previous = index
        }
        cursor.release()
    }
    await Strata.flush(writes)
}
