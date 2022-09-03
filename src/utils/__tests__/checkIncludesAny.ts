import { checkIncludesAny } from '../index';
import { schema } from './mocks';

describe('checkIncludesVar', () => {
    it('Передаем в "node" узел в котором есть __any__', () => {
        expect(checkIncludesAny(schema.src.pages.__var__pageName.model)).toBe(true);
    });

    it('Передаем в "node" узел в котором нет __any__', () => {
        expect(checkIncludesAny(schema.src.pages.__var__pageName)).toBe(false);
    });
});
