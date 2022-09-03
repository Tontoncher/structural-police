import { replaceVariables } from '../index';

const variables = {
    '__var__pageName': 'somePage',
    '__var__appName': 'someApp',
    '__var__featureName': 'someFeature',
    '__var__notUsedName': 'notUsed',
};
const pathArray = [
    'src/pages/mainPage/ui',
    'src/pages/__var__pageName/ui',
    'apps/__var__appName/features/__var__featureName/model'
];
const replacedPathArray = [
    'src/pages/mainPage/ui',
    'src/pages/somePage/ui',
    'apps/someApp/features/someFeature/model'
];

describe('replaceVariables', () => {
    it('Проверка замены переменных на их значения в путях', () => {
        expect(replaceVariables(pathArray, variables)).toEqual(replacedPathArray);
    });
});
