class Args {
    constructor(schema, input) {
        this.parseSchema(schema);
        this.parseInput(input)
    }

    parseSchema(rawSchema) {
        const args = {}

        rawSchema.split(',').map(e => e.trim()).forEach(element => {
            const name = element.substring(0, 1)
            const type = element.substring(1)
            switch (type) {
                case '*':
                    args[name] = new StringArg(name)
                    break
                case '#':
                    args[name] = new NumberArg(name)
                    break
                case '[#]':
                    args[name] = new NumberArrayArg(name)
                    break
                default:
                    args[name] = new BooleanArg()
            }
        })

        this.args = args
    }

    parseInput(input) {
        const args = this.args

        const tokens = input.split(' ')
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const MODIFIER_REGEX = /-([a-z]{1})/
            if (MODIFIER_REGEX.test(token)) {
                const modifier = MODIFIER_REGEX.exec(token)[1]
                args[modifier].set(tokens[i], tokens, i)
            }
        }
    }

    get(name) {
        return this.args[name].get()
    }
}

class BooleanArg {
    set() {
        this.val = true
    }
    get() {
        return this.val || false
    }
}
class StringArg {
    constructor(name) {
        this.name = name
    }
    set(current, tokens, index) {
        const next = tokens[index + 1]
        if (!next || next.startsWith('-')) {
            this.missing = true
            return
        }
        this.val = next.toString()
    }
    get() {
        if (this.missing) {
            throw new Error(`value is missing for -${this.name}`)
        }
        return this.val || ""
    }
}
class NumberArg {
    constructor(name) {
        this.name = name
    }
    set(current, tokens, index) {
        this.rawVal = tokens[index + 1]
        if (!this.rawVal || this.rawVal.startsWith('-')) {
            this.missing = true
            return
        }
        this.val = parseInt(tokens[index + 1])
    }
    get() {
        if (this.missing) {
            throw new Error(`value is missing for -${this.name}`)
        }
        if (this.val !== undefined && isNaN(this.val)) {
            throw new Error(`${this.rawVal} is not a number`)
        }
        return this.val || -1
    }
}
class NumberArrayArg {
    constructor(name) {
        this.name = name
        this.val = []
    }
    set(current, tokens, index) {
        const next = tokens[index + 1]
        if (!next || next.startsWith('-')) {
            this.missing = true
            return
        }
        for (let i = index + 1; i < tokens.length && !tokens[i].startsWith('-'); i++) {
            const token = tokens[i]
            if (token.indexOf(',') > -1) {
                this.parseCommaSeparatedList(token)
            } else {
                this.parseSingleValue(token)
            }
        }
    }
    parseCommaSeparatedList(token) {
        token.split(',').forEach(t => this.val.push(parseInt(t)))
    }
    parseSingleValue(token) {
        this.val.push(parseInt(token));
    }
    get() {
        if (this.missing) {
            throw new Error(`value is missing for -${this.name}`)
        }
        return this.val || []
    }
}

class ListIterator {
    constructor(list) {
        this.list = list
        this.length = list.length
        this.cursor = 0
    }
    hasNext() {
        return this.cursor != length - 1
    }
    hasPrevious() {
        return this.cursor > 0
    }
    next() {
        if (this.hasNext()) {
            return list[--cursor]
        } else {
            throw new Error('no more elements')
        }
    }
    previous() {
        if(this.hasPrevious()) {
            return list[--cursor]
        } else {
            throw new Error('already at head of the list')
        }
    }
}

describe('args parser', () => {
    describe('boolean args', () => {
        it('parses boolean arg', () => {
            const args = new Args("l", "-l")
            expect(args.get("l")).toBe(true);
        })
        it('parses another boolean arg', () => {
            const args = new Args("m", "-m")
            expect(args.get("m")).toBe(true)
        })
        it('parses default boolean arg', () => {
            const args = new Args("l", "");
            expect(args.get("l")).toBe(false);
        })
    })
    describe('number args', () => {
        it('parses number arg', () => {
            const args = new Args("p#", "-p 8080")
            expect(args.get("p")).toBe(8080);
        })
        it('parses another number arg', () => {
            const args = new Args("n#", "-n 100")
            expect(args.get("n")).toBe(100);
        })
        it('parses default number arg', () => {
            const args = new Args("p#", "")
            expect(args.get("p")).toBe(-1)
        })
    })
    describe('string args', () => {
        it('parses string arg', () => {
            const args = new Args("d*", "-d /var/logs/")
            expect(args.get('d')).toBe('/var/logs/')
        })
        it('parses default string arg', () => {
            const args = new Args("d*", "")
            expect(args.get('d')).toBe('')
        })
    })
    describe('mixed args', () => {
        describe('parses mixed args', () => {
            describe('for -d /var/logs -p 8080 with schema d*,p#', () => {
                const args = new Args("d*, p#", "-d /var/logs/ -p 8080")
                it('parses -d to "/var/logs/"', () => {
                    expect(args.get('d')).toBe('/var/logs/')
                })
                it('parses -p to 8080', () => {
                    expect(args.get('p')).toBe(8080)
                })
            })
            describe('for -p 8080 -d /var/logs with schema d*,p#', () => {
                const args = new Args("d*, p#", "-p 8080 -d /var/logs/")
                it('parses -d to "/var/logs/"', () => {
                    expect(args.get('d')).toBe('/var/logs/')
                })
                it('parses -p to 8080', () => {
                    expect(args.get('p')).toBe(8080)
                })
            })
            describe('for "" with schema d*,p#', () => {
                const args = new Args("d*,p#", "")
                it('parses -d to ""', () => {
                    expect(args.get('d')).toBe('')
                })
                it('parses -p to -1', () => {
                    expect(args.get('p')).toBe(-1)
                })
            })
            describe('for -g 1 2 3 -d /var/logs with schema g[#], d*', () => {
                const args = new Args('g[#],d*', '-d /var/logs/ -g 1 2 3')
                it('parses -d to /var/logs/', () => {
                    expect(args.get('d')).toBe('/var/logs/')
                })
                it('parses -g to [1, 2, 3]', () => {
                    expect(args.get('g')).toStrictEqual([1, 2, 3])
                })
            })
        })
    })
    describe('array args', () => {
        it('parses number array args', () => {
            const args = new Args('g[#]', '-g 1 2 3')
            expect(args.get('g')).toStrictEqual([1, 2, 3])
        })
        it('parses default array args as empty array', () => {
            const args = new Args('g[#]', '')
            expect(args.get('g')).toStrictEqual([])
        })
        it('can specify multiple times', () => {
            const args = new Args('g[#]', '-g 1 -g 2 -g 3')
            expect(args.get('g')).toStrictEqual([1, 2, 3])
        })
        it('can specify as comma-seperated list', () => {
            const args = new Args('g[#]', '-g 1,2,3')
            expect(args.get('g')).toStrictEqual([1, 2, 3])
        })
    })
    describe('invalid inputs', () => {
        it('report error if pass an string to a number arg', () => {
            const args = new Args('p#', '-p foo')
            expect(() => { args.get('p') }).toThrow("foo is not a number")
        })
        it('report error is arg value is missing for single arg', () => {
            const args = new Args('d*', '-d')
            expect(() => { args.get('d') }).toThrow('value is missing for -d')
        })
        it('reports error if string arg value is missing for mixed args', () => {
            const args = new Args('l,d*', '-d -l')
            expect(args.get('l')).toBe(true)
            expect(() => { args.get('d') }).toThrow('value is missing for -d')
        })
        it('reports error is number arg value is missing', () => {
            const args = new Args('p#', '-p')
            expect(() => { args.get('p') }).toThrow('value is missing for -p')
        })
        it('reports error is number array values are missing', () => {
            const args = new Args('g[#]', '-g')
            expect(() => { args.get('g') }).toThrow('value is missing for -g')
        })
    })
})