require('proof')(1, async okay => {
    const path = require('path')

    const Strata = require('b-tree')
    const Cache = require('b-tree/cache')
    const Destructible = require('destructible')

    const advance = require('advance')
    const riffle = require('riffle')
    const twiddle = require('twiddle')

    const utilities = require('b-tree/utilities')

    const splice = require('..')

    const directory = path.resolve(__dirname, './tmp/splice')

    await utilities.reset(directory)
    await utilities.serialize(directory, {
      '0.0': [ [ '0.1', null ], [ '1.1', 'g' ], [ '1.3', 'p' ] ],
      '0.1': [ [ 'right', 'g' ], [ 'insert', 0, 'b' ], [ 'insert', 1, 'c' ], [ 'insert', 2, 'e' ] ],
      '1.1': [ [ 'right', 'p' ], [ 'insert', 0, 'g' ], [ 'insert', 1, 'k' ], [ 'insert', 2, 'l' ] ],
      '1.3': [ [ 'insert', 0, 'p' ], [ 'insert', 1, 'q' ], [ 'insert', 2, 'v' ], [ 'delete', 0 ] ]
    })

    await async function () {
        const destructible = new Destructible([ 'splice.t' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const mutation = twiddle(advance.forward([
            [ 'a' ], [ 'b', 'c', 'f', 'g' ], [ 'p', 'q', 'r', 'z' ]
        ]), item => { return { key: item, value: 'x' } })
        await splice(function (item) {
            return item.key == 'b' || item.key == 'g' ? 'remove' : 'insert'
        }, strata, mutation)
        const gathered = []
        for await (const items of riffle.forward(strata, Strata.MIN)) {
            for (const item of items) {
                gathered.push({ key: item.key, value: item.value })
            }
        }
        okay(gathered, [{
            key: 'a', value: 'x'
        }, {
            key: 'c', value: 'x'
        }, {
            key: 'e', value: 'e'
        }, {
            key: 'f', value: 'x'
        }, {
            key: 'k', value: 'k'
        }, {
            key: 'l', value: 'l'
        }, {
            key: 'p', value: 'x'
        }, {
            key: 'q', value: 'x'
        }, {
            key: 'r', value: 'x'
        }, {
            key: 'v', value: 'v'
        }, {
            key: 'z', value: 'x'
        }], 'splice')
        strata.close()
        await destructible.destructed
    } ()
})
