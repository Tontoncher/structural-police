import { replaceBackSlash } from '../index';

describe('replaceBackSlash', () => {
    it('Прямые слэши оставляем', () => {
        expect(replaceBackSlash('src/utils/someUtil'))
            .toBe('src/utils/someUtil');
    });

    it('Обратные слэши меняем на прямые', () => {
        expect(replaceBackSlash('src\\utils\\someUtil'))
            .toBe('src/utils/someUtil');
    });

    it('Микс из слэшей меняем на прямые', () => {
        expect(replaceBackSlash('src/utils\\someUtil'))
            .toBe('src/utils/someUtil');
    });
});