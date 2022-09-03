import { checkImportPermission } from '../index';

describe('checkImportPermission', () => {
    it('Проверка отсутствия правил', () => {
        expect(checkImportPermission(
            'src/features/someFeature',
            {},
        )).toBe(false);
    });

    it('Проверка наличия пути в everywhereAllowed', () => {
        expect(checkImportPermission(
            'src/features/someFeature',
            {
                everywhereAllowed: ['src/pages', 'src/features'],
            },
        )).toBe(true);
    });

    it('Проверка стандартно запрещенных импортов', () => {
        expect(checkImportPermission(
            'src/features/someFeature',
            {
                defaultAllowed: false,
            },
        )).toBe(false);
    });

    it('Проверка стандартно запрещенных импортов c разрешением некоторых', () => {
        expect(checkImportPermission(
            'src/features/someFeature',
            {
                defaultAllowed: false,
                allowed: ['src/features'],
            },
        )).toBe(true);
    });

    it('Проверка стандартно разрешенных импортов', () => {
        expect(checkImportPermission(
            'src/features/someFeature',
            {
                defaultAllowed: true,
            },
        )).toBe(true);
    });

    it('Проверка стандартно разрешенных импортов c рапрещением некоторых', () => {
        expect(checkImportPermission(
            'src/features/someFeature',
            {
                defaultAllowed: true,
                disallowed: ['src/features'],
            },
        )).toBe(false);
    });
});
