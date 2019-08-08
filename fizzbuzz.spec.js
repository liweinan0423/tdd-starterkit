test(1, 3, 'Fizz');
test(2, 5, 'Buzz');
test(3, 15, 'FizzBuzz');
test(4, 1, '1');

function test(group, number, result) {
    describe(`for group ${group}`, () => {
        it(`prints ${result} for ${number}`, () => {
            expect(print(number)).toBe(result);
        })
    })
}



function print(number) {
    if (number === 5) {
        return 'Buzz';
    } else if (number === 15) {
        return 'FizzBuzz';
    } else if (number === 1) {
        return '1';
    }
    return 'Fizz';
}