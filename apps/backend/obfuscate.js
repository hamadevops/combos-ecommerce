const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');

const path = '../../dist/apps/backend/main.js';

fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
        return console.log(err);
    }

    const result = JavaScriptObfuscator.obfuscate(data, {
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: false,
        renameGlobals: false,
        rotateStringArray: true,
        selfDefending: false,
        shuffleStringArray: true,
        simplify: true,
        splitStrings: false,
        stringArray: true,
        stringArrayEncoding: [],
        stringArrayIndexShift: true,
        stringArrayWrappersCount: 1,
        stringArrayWrappersChainedCalls: false,
        stringArrayWrappersParametersMaxCount: 2,
        stringArrayWrappersType: 'variable',
        stringArrayThreshold: 0.75,
        transformObjectKeys: false,
        unicodeEscapeSequence: false,
        target: 'node',
        reservedNames: [
            '^.*Dto$',
            '^.*Entity$',
            '^.*Module$',
            '^.*Controller$',
            '^.*Service$',
            'EntityManager',
            'SqlEntityManager',
            'UserRepository',
            'EntityRepository',
            'MikroOrmModule',
            'Inject',
            'Injectable',
            'Optional',
            'ForwardRef',
        ],
    });

    fs.writeFile(path, result.getObfuscatedCode(), (err) => {
        if (err) {
            return console.log(err);
        }
        console.log('Obfuscated successfully!');
    });
});
