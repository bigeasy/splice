require('proof')(1, async okay => {
    const path = require('path')

    const Strata = require('b-tree')
    const Cache = require('b-tree/cache')
    const Trampoline = require('skip')
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
        const twiddled = twiddle(advance.forward([
            [ 'a' ], [ 'b', 'c', 'f', 'g' ], [ 'p', 'q', 'r', 'z' ]
        ]), items => items.map(item => { return { key: item, value: 'x' } }))
        const mutation = {
            done: false,
            next (trampoline, consume, terminator = mutation) {
                twiddled.next(trampoline, consume, terminator)
                trampoline.push(Promise.resolve(true))
            }
        }
        await splice(function (item) {
            return {
                key: item.key,
                parts: item.key == 'b' || item.key == 'g' ? null : [ item.key, 'x' ]
            }
        }, strata, mutation)
        const gathered = [], trampoline = new Trampoline
        const iterator = riffle.forward(strata, Strata.MIN)
        while (! iterator.done) {
            iterator.next(trampoline, items => {
                for (const item of items) {
                    gathered.push({ key: item.key, parts: item.parts })
                }
            })
            while (trampoline.seek()) {
                await trampoline.shift()
            }
        }
        okay(gathered, [{
            key: 'a', parts: [ 'a', 'x' ]
        }, {
            key: 'c', parts: [ 'c', 'x' ]
        }, {
            key: 'e', parts: [ 'e' ]
        }, {
            key: 'f', parts: [ 'f', 'x' ]
        }, {
            key: 'k', parts: [ 'k' ]
        }, {
            key: 'l', parts: [ 'l' ]
        }, {
            key: 'p', parts: [ 'p', 'x' ]
        }, {
            key: 'q', parts: [ 'q', 'x' ]
        }, {
            key: 'r', parts: [ 'r', 'x' ]
        }, {
            key: 'v', parts: [ 'v' ]
        }, {
            key: 'z', parts: [ 'z', 'x' ]
        }], 'splice')
        strata.destructible.destroy().rejected
    } ()
})
