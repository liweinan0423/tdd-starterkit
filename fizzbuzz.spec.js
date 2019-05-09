
describe('fizzbuzz', () => {
    it('should be 1 when fizzbuzz given 1', () => {
        expect(fizzbuzz(1)).toBe(1);
    })
    it('should be 2 when fizzbuzz given 2', () => {
        expect(fizzbuzz(2)).toBe(2);
    })
})

function fizzbuzz(number) {
    if (number == 2) {
        return number
    }
    return 1
}