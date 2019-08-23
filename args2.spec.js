describe('boolean args', () => {
    it('for schema "l", args "-l", l should be true', () => {
        const parser = new ArgsParser('l', '-l')
        expect(parser.get('l')).toBe(true)
    })
    it('for schema "l", args "", l should be false', () => {
        const parser = new ArgsParser('l', '')
        expect(parser.get('l')).toBe(false)
    })

    it('g, -g', () => {
        const parser = new ArgsParser('g', '-g')
        expect(parser.get('g')).toBe(true)
    })
    it('explicit boolean value', () => {
        expect(new ArgsParser('l', '-l true').get('l')).toBe(true)
        expect(new ArgsParser('l', '-l false').get('l')).toBe(false)
    })
})
describe('number args', () => {
    it('p#, -p 8080', () => {
        const parser = new ArgsParser('p#', '-p 8080')
        expect(parser.get('p')).toBe(8080)
    })
    it('m#, -m 123', () => {
        const parser = new ArgsParser('m#', '-m 123')
        expect(parser.get('m')).toBe(123)
    })
    it('p#, ""', () => {
        const parser = new ArgsParser('p#', '')
        expect(parser.get('p')).toBe(-1)
    })
})
describe('string args', () => {
    it('d*, -d /var/logs/', () => {
        const parser = new ArgsParser('d*', '-d /var/logs/')
        expect(parser.get('d')).toBe('/var/logs/')
    })
    it('d*', () => {
        const parser = new ArgsParser('d*', '')
        expect(parser.get('d')).toBe('')
    })
    it('s*, -s abc', () => {
        const parser = new ArgsParser('s*', '-s abc')
        expect(parser.get('s')).toBe('abc')
    })
})
describe('mixed args', () => {
    describe('d*,l "-d /var/logs/ -l"', () => {
        let parser;
        beforeEach(() => {
            parser = new ArgsParser('d*,l', '-d /var/logs/ -l')
        })
        it('-d should be /var/logs/', () => {
            expect(parser.get('d')).toBe('/var/logs/')
        })
    })
    describe('d*,l "-l -d /var/logs/"', () => {
        let parser;
        beforeEach(() => {
            parser = new ArgsParser('d*,l', '-l -d /var/logs/')
        })
        it('-d should be /var/logs/', () => {
            expect(parser.get('d')).toBe('/var/logs/')
        })
        it('-l should be true', () => {
            expect(parser.get('l')).toBe(true)
        })
    })
    describe('d*,l "-d /var/logs/"', () => {
        let parser;
        beforeEach(() => {
            parser = new ArgsParser('d*,l', '-d /var/logs/')
        })
        it('-l should be false', () => {
            expect(parser.get('l')).toBe(false)
        })
    })
    describe('d*,l "-l"', () => {
        let parser;
        beforeEach(() => {
            parser = new ArgsParser('d*,l', '-l')
        })
        it('-d should be ""', () => {
            expect(parser.get('d')).toBe('')
        })
    })
    describe('p#,l, "-l -p 8080', () => {
        let parser;
        beforeEach(() => {
            parser = new ArgsParser('p#,l', '-l -p 8080')
        })
        it('-p should be 8080', () => {
            expect(parser.get('p')).toBe(8080)
        })
    })
})
describe('exception handling', () => {
    describe('missing number value', () => {
        it('missing number value', () => {
            expect(() => new ArgsParser('p#', '-p').get('p')).toThrow('value is missing for p')
            expect(() => new ArgsParser('p#,d*', '-p -d /var/logs/').get('p')).toThrow('value is missing for p')
            expect(() => new ArgsParser('p#,d*', '-d /var/logs/ -p').get('p')).toThrow('value is missing for p')
        })
        it('invalid number value', () => {
            expect(() => new ArgsParser('p#', '-p abc').get('p')).toThrow('"abc" is not a number')
        })
        it('missing string value', () => {
            expect(() => new ArgsParser('p#,d*', '-p 8080 -d').get('d')).toThrow('value is missing for d')
            expect(() => new ArgsParser('p#,d*', '-d -p 8080').get('d')).toThrow('value is missing for d')
            expect(() => new ArgsParser('d*', '-d').get('d')).toThrow('value is missing for d')
        })
        it('invalid boolean value', () => {
            expect(() => new ArgsParser('l', '-l foo').get('l')).toThrow('foo is not a boolean value')
        })
    })
})
class ArgsParser {
    constructor(schema, args) {
        this.args = args
        this.parseSchema(schema)
        this.parseArgs()
    }

    parseSchema(raw) {
        this.schema = {}
        raw.split(',').map(raw => raw.trim()).forEach(raw => {
            const name = raw.substring(0, 1)
            const type = raw.substring(1)
            this.schema[name] = createArg(type, this.args, name)
        })
    }

    parseArgs() {
        const tokens = this.args.split(' ')
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]
            if (token.startsWith('-')) {
                const argName = token.substring(1)
                const arg = this.schema[argName]
                arg.set(tokens, i)
            }
        }
    }

    get(name) {
        return this.schema[name].get()
    }
}

function createArg(rawType, args, name) {
    switch (rawType) {
        case '#':
            return new NumberArg(args, name)
        case '*':
            return new StringArg(args, name)
        default:
            return new BooleanArg(args, name)
    }
}

class NumberArg {
    constructor(args, name) {
        this.args = args
        this.name = name
    }
    get() {
        return this.val || -1
    }
    set(tokens, i) {
        const nextToken = tokens[i + 1]
        if (typeof nextToken === 'string') {
            if (nextToken.startsWith('-')) {
                throw new Error(`value is missing for ${this.name}`)
            } else {
                const value = parseInt(nextToken)
                if (isNaN(value)) {
                    throw new Error(`"${nextToken}" is not a number`)
                } else {
                    this.val = value
                }
            }
        } else if (typeof nextToken === 'undefined') {
            throw new Error(`value is missing for ${this.name}`)
        }
    }
}
class StringArg {
    constructor(args, name) {
        this.args = args
        this.name = name
    }
    get() {
        return this.val || ''
    }
    set(tokens, i) {
        const val = tokens[i + 1]
        if (!val || val.startsWith('-')) {
            throw new Error(`value is missing for ${this.name}`)
        }
        this.val = tokens[i + 1]
    }
}
class BooleanArg {
    constructor(args, name) {
        this.args = args
        this.name = name
    }
    get() {
        return this.val || false
    }
    set(tokens, i) {
        const nextToken = tokens[i + 1]
        if (typeof nextToken === 'string') {
            if (!nextToken.startsWith('-') && nextToken !== "true" && nextToken !== "false") {
                throw new Error(`${nextToken} is not a boolean value`)
            }
            if (nextToken === "false") {
                this.val = false
            } else {
                this.val = true
            }
        } else {
            this.val = true
        }
    }
}