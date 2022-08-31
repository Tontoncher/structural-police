import { checkCompeteMatch } from '../utils';
import { schema } from './mocks';

describe('checkCompeteMatch', () => {
    it('Передаем в "path" существующий узел', () => {
        expect(checkCompeteMatch(schema, 'src')).toBe(true);
    });

    it('Передаем в "path" отсутствующий узел', () => {
        expect(checkCompeteMatch(schema, 'constants')).toBe(false);
    });
});
