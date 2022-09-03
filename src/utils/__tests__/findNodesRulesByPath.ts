import { findNodesRulesByPath } from '../index';
import { defaultErrorMessages } from '../../constants';
import { schema } from './mocks';

const makeRules = (number, variables = {}) => ({
    error: false,
    value: {
        rulesNumber: number,
        variables,
    },
});

describe('findNodesRulesByPath', () => {
    it('Проверка узла в котором есть правила', () => {
        expect(findNodesRulesByPath('src/features/someFeature', schema, true))
            .toEqual(makeRules(3));
    });

    it('Проверка узла в котором нет правил, наследование включено', () => {
        expect(findNodesRulesByPath('src/features', schema, true))
            .toEqual(makeRules(1));
    });

    it('Проверка узла в котором нет правил, наследование выключено', () => {
        expect(findNodesRulesByPath('src/features', schema, false))
            .toEqual({
                error: defaultErrorMessages.missingRules({
                    schemaPath: 'src/features',
                }),
            });
    });

    it('Проверка узла в котором есть правила и есть переменные в пути', () => {
        expect(findNodesRulesByPath('src/pages/somePage/model', schema, true))
            .toEqual(makeRules(2, { '__var__pageName': 'somePage' }));
    });

    it('Проверка узла не описанного в схеме, наследование включено, __any__ отсутствует', () => {
        expect(findNodesRulesByPath('src/features/someFeature/model/constant', schema, true))
            .toEqual({
                error: defaultErrorMessages.missingFile({
                    schemaPath: 'src/features/someFeature/model',
                    missingNode: 'constant',
                }),
            });
    });

    it('Проверка узла не описанного в схеме, наследование выключено, __any__ отсутствует', () => {
        expect(findNodesRulesByPath('src/features/someFeature/model/constant', schema, false))
            .toEqual({
                error: defaultErrorMessages.missingFile({
                    schemaPath: 'src/features/someFeature/model',
                    missingNode: 'constant',
                }),
            });
    });

    it('Проверка узла не описанного в схеме, наследование включено, __any__ = true', () => {
        expect(findNodesRulesByPath('src/features/someFeature/ui/form', schema, true))
            .toEqual(makeRules(3));
    });

    it('Проверка узла не описанного в схеме, наследование выключено, __any__ = true', () => {
        expect(findNodesRulesByPath('src/features/someFeature/ui/form', schema, false))
            .toEqual({
                error: defaultErrorMessages.missingRules({
                    schemaPath: 'src/features/someFeature/ui',
                }),
            });
    });
});
