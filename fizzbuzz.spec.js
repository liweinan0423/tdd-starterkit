
describe('fizzbuzz', () => {
    testNormalNumber(1);
    testNormalNumber(2);
    testNormalNumber(4)
    testFizz(3);
    testFizz(6);
    testFizz(9);
    testBuzz(5);
    testBuzz(10);
    testBuzz(25);
    testFizzBuzz(15);
    testFizzBuzz(30);
})

function testFizzBuzz(number) {
    it(`should be fizzbuzz when fizzbuzz given ${number}`, () => {
        expect(fizzbuzz(number)).toBe("fizzbuzz")
    })
}
function testBuzz(number) {
    it(`should be buzz when fizzbuzz given ${number}`, () => {
        expect(fizzbuzz(number)).toBe("buzz")
    })
}
function testFizz(number) {
    it(`should be fizz when fizzbuzz given ${number}`, () => {
        expect(fizzbuzz(number)).toBe("fizz")
    })
}
function testNormalNumber(number) {
    it(`should be ${number} when fizzbuzz given ${number}`, () => {
        expect(fizzbuzz(number)).toBe(number)
    })
}

function fizzbuzz(number) {
    if (number % 3 === 0 && number % 5 !== 0) {
        return 'fizz'
    } else if (number % 5 === 0 && number % 3 !== 0) {
        return 'buzz'
    } else if (number % 5 === 0 && number % 3 === 0) {
        return 'fizzbuzz'
    }
    return number;
}