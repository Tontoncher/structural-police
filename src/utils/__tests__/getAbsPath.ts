import { getAbsPath } from '../index';

describe('getAbsPath', () => {
    it('Путь до внешнего файла остается без изменений', () => {
        expect(getAbsPath('src/App.jsx', 'react')).toBe('react');
    });

    it('Относительный путь остается без изменений', () => {
        expect(getAbsPath('src/pages/mainPage/index.jsx', 'src/App.jsx')).toBe('src/App.jsx');
    });

    it('Относительный путь заменяется на абсолютный по проекту', () => {
        expect(getAbsPath('src/pages/mainPage/index.jsx', '../../feature/someForm/index.jsx')).toBe('src/feature/someForm/index.jsx');
    });
});
