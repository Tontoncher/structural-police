import { defaultErrorMessages } from '../index';

describe('defaultErrorMessages', () => {
    it('Проверка importDisallow', () => {
        expect(defaultErrorMessages.importDisallow({ absoluteImportPath: 'someAbsPath' }))
            .toBe('Not allowed to import from "someAbsPath"');
    });

    it('Проверка missingFile', () => {
        expect(defaultErrorMessages.missingFile({ schemaPath: 'somePath', missingNode: 'someNode' }))
            .toBe('The file is not described in the schema. In "somePath" expected a node "someNode"');
    });

    it('Проверка missingRules', () => {
        expect(defaultErrorMessages.missingRules({ schemaPath: 'somePath' }))
            .toBe('There is no set of rules in the "somePath"');
    });
});