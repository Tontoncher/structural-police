import { startsWithOneOf } from '../index';

describe('startsWithOneOf', () => {
    it('В массиве есть элемент, с которого начинается строка', () => {
        expect(startsWithOneOf('src/utils', ['dist', 'packages', 'src'])).toBe(true);
    });

    it('В массиве нет элемента, с которого начинается строка', () => {
        expect(startsWithOneOf('src/utils', ['dist', 'packages'])).toBe(false);
    });

    it('Пустой массив', () => {
        expect(startsWithOneOf('src/utils', [])).toBe(false);
    });

    it('Пустая строка', () => {
        expect(startsWithOneOf('', ['dist', 'packages', 'src'])).toBe(false);
    });
});
