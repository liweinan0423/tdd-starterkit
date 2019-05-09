
describe('fizzbuzz', () => {
    testNormalNumber(1);
    testNormalNumber(2);
    testNormalNumber(4)
})

function testNormalNumber(number) {
    it(`should be ${number} when fizzbuzz given ${number}`, () => {
        expect(fizzbuzz(number)).toBe(number)
    })
}

function fizzbuzz(number) {
    return number;
}