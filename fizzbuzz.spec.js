
describe('fizzbuzz', () => {
    testNormalNumber(1);
    testNormalNumber(2);
    testNormalNumber(4)
    testFizz(3);
})


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
    return number === 3 ? 'fizz' : number;
}