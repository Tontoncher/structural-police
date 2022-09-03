import { checkIncludesVar } from '../index';
import { schema } from './mocks';

describe('checkIncludesVar', () => {
    it('Передаем в "node" узел в котором есть __var__переменная', () => {
        expect(checkIncludesVar(schema.src.pages, 'some_page')).toEqual({ key: '__var__pageName', value: 'some_page' });
    });

    it('Передаем в "node" узел в котором нет __var__переменной', () => {
        expect(checkIncludesVar(schema.src, 'pages')).toBe(false);
    });
});
