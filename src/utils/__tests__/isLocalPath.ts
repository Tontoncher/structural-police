import { isLocalPath } from '../index';

describe('isLocalPath', () => {
    it('Адрес начинается с .', () => {
        expect(isLocalPath('./src/utils', ['dist', 'packages', 'src'])).toBe(true);
    });

    it('В массиве есть элемент, с которого начинается строка', () => {
        expect(isLocalPath('src/utils', ['dist', 'packages', 'src'])).toBe(true);
    });

    it('В массиве нет элемента, с которого начинается строка', () => {
        expect(isLocalPath('src/utils', ['dist', 'packages'])).toBe(false);
    });

    it('Пустой массив', () => {
        expect(isLocalPath('src/utils', [])).toBe(false);
    });

    it('Пустая строка', () => {
        expect(isLocalPath('', ['dist', 'packages', 'src'])).toBe(false);
    });
});
